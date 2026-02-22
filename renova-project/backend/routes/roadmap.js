// ─── Roadmap Routes ─────────────────────────────────────────────────────────
// GET   /api/roadmap       — Get all roadmap milestones for user
// PATCH /api/roadmap/:id   — Toggle done status of a milestone
// POST  /api/roadmap       — Add a custom milestone
// PUT   /api/roadmap/:id   — Update a milestone
// DELETE /api/roadmap/:id  — Delete a milestone
// ────────────────────────────────────────────────────────────────────────────

const express = require("express");
const supabase = require("../config/supabase");
const { authenticate } = require("../middleware/auth");
const { generateRoadmap } = require("../services/roadmapEngine");

const router = express.Router();

// ─── GET ALL MILESTONES ─────────────────────────────────────────────────────
router.get("/", authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("roadmap")
      .select("*")
      .eq("user_id", req.user.id)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    // Compute progress
    const total = (data || []).length;
    const done = (data || []).filter((m) => m.done).length;

    res.json({
      roadmap: data || [],
      progress: { total, done, percentage: total > 0 ? Math.round((done / total) * 100) : 0 },
    });
  } catch (err) {
    console.error("Get roadmap error:", err);
    res.status(500).json({ error: "Failed to fetch roadmap." });
  }
});

// ─── TOGGLE MILESTONE DONE ──────────────────────────────────────────────────
router.patch("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { done } = req.body;

    // Get current state if `done` not explicitly provided
    if (done === undefined) {
      const { data: current } = await supabase
        .from("roadmap")
        .select("done")
        .eq("id", id)
        .eq("user_id", req.user.id)
        .single();

      if (!current) return res.status(404).json({ error: "Milestone not found." });

      const { data, error } = await supabase
        .from("roadmap")
        .update({ done: !current.done, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", req.user.id)
        .select()
        .single();

      if (error) throw error;

      return res.json({ message: "Milestone toggled.", milestone: data });
    }

    // Explicit done value
    const { data, error } = await supabase
      .from("roadmap")
      .update({ done, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select()
      .single();

    if (error) throw error;

    // Update dashboard comeback score based on roadmap progress
    await updateComebackScore(req.user.id);

    res.json({ message: "Milestone updated.", milestone: data });
  } catch (err) {
    console.error("Toggle milestone error:", err);
    res.status(500).json({ error: "Failed to update milestone." });
  }
});

// ─── ADD CUSTOM MILESTONE ───────────────────────────────────────────────────
router.post("/", authenticate, async (req, res) => {
  try {
    const { title, description, week } = req.body;

    if (!title) return res.status(400).json({ error: "Title is required." });

    // Get max sort_order
    const { data: existing } = await supabase
      .from("roadmap")
      .select("sort_order")
      .eq("user_id", req.user.id)
      .order("sort_order", { ascending: false })
      .limit(1);

    const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 1;

    const { data, error } = await supabase
      .from("roadmap")
      .insert({
        user_id: req.user.id,
        title,
        description: description || "",
        week: week || "",
        done: false,
        sort_order: nextOrder,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Milestone added.", milestone: data });
  } catch (err) {
    console.error("Add milestone error:", err);
    res.status(500).json({ error: "Failed to add milestone." });
  }
});

// ─── UPDATE MILESTONE ───────────────────────────────────────────────────────
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = ["title", "description", "week", "done", "sort_order"];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("roadmap")
      .update(updates)
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "Milestone updated.", milestone: data });
  } catch (err) {
    console.error("Update milestone error:", err);
    res.status(500).json({ error: "Failed to update milestone." });
  }
});

// ─── DELETE MILESTONE ───────────────────────────────────────────────────────
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { error } = await supabase
      .from("roadmap")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.user.id);

    if (error) throw error;

    res.json({ message: "Milestone deleted." });
  } catch (err) {
    console.error("Delete milestone error:", err);
    res.status(500).json({ error: "Failed to delete milestone." });
  }
});

// ─── Helper: Update comeback score based on roadmap progress ────────────────
async function updateComebackScore(userId) {
  try {
    const { data: roadmap } = await supabase
      .from("roadmap")
      .select("done")
      .eq("user_id", userId);

    if (!roadmap || roadmap.length === 0) return;

    const doneCount = roadmap.filter((r) => r.done).length;
    const progressBonus = Math.round((doneCount / roadmap.length) * 30);

    const { data: metrics } = await supabase
      .from("dashboard_metrics")
      .select("comeback_score, confidence_history")
      .eq("user_id", userId)
      .single();

    if (metrics) {
      const baseScore = Math.max(metrics.comeback_score - 30, 20); // Remove old progress bonus
      const newScore = Math.min(baseScore + progressBonus, 100);

      await supabase
        .from("dashboard_metrics")
        .update({ comeback_score: newScore, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
    }
  } catch (err) {
    console.error("Update comeback score error:", err);
  }
}

// ─── REGENERATE ROADMAP FROM PROFILE ────────────────────────────────────────
// POST /api/roadmap/generate — Regenerate personalized roadmap based on current profile
router.post("/generate", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get profile with sub-sections
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, skills, target_roles, headline")
      .eq("user_id", userId)
      .single();

    // Get onboarding data
    const { data: onboarding } = await supabase
      .from("onboarding")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!profile && !onboarding) {
      return res.status(400).json({ error: "Complete onboarding or update your profile first." });
    }

    // Get experience for richer context
    let experience = [];
    if (profile?.id) {
      const { data } = await supabase.from("experience").select("title, company").eq("profile_id", profile.id);
      experience = data || [];
    }

    // Generate personalized roadmap
    const milestones = generateRoadmap({
      profile: { ...profile, experience },
      onboarding: onboarding || {},
    });

    // Delete existing roadmap and insert new one
    await supabase.from("roadmap").delete().eq("user_id", userId);
    const roadmapItems = milestones.map((item) => ({
      ...item,
      user_id: userId,
    }));
    const { error } = await supabase.from("roadmap").insert(roadmapItems);
    if (error) throw error;

    // Return the new roadmap
    const { data: newRoadmap } = await supabase
      .from("roadmap")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true });

    const total = (newRoadmap || []).length;
    const done = (newRoadmap || []).filter((m) => m.done).length;

    res.json({
      message: "Roadmap regenerated based on your profile.",
      roadmap: newRoadmap || [],
      progress: { total, done, percentage: 0 },
    });
  } catch (err) {
    console.error("Regenerate roadmap error:", err);
    res.status(500).json({ error: "Failed to regenerate roadmap." });
  }
});

module.exports = router;
