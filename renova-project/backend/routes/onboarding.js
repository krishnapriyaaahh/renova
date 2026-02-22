// ─── Onboarding Routes ──────────────────────────────────────────────────────
// POST /api/onboarding       — Save onboarding data (5-step wizard)
// GET  /api/onboarding       — Get current onboarding data
// PUT  /api/onboarding       — Update onboarding data
// ────────────────────────────────────────────────────────────────────────────

const express = require("express");
const supabase = require("../config/supabase");
const { authenticate } = require("../middleware/auth");
const { generateRoadmap } = require("../services/roadmapEngine");

const router = express.Router();

// ─── SAVE ONBOARDING ───────────────────────────────────────────────────────
router.post("/", authenticate, async (req, res) => {
  try {
    const { career_break_years, last_role, industry, skills, confidence, goal } = req.body;
    const userId = req.user.id;

    // Upsert onboarding data
    const { data, error } = await supabase
      .from("onboarding")
      .upsert({
        user_id: userId,
        career_break_years,
        last_role,
        industry,
        skills: skills || [],
        confidence: confidence || 50,
        goal,
        completed: true,
      }, { onConflict: "user_id" })
      .select()
      .single();

    if (error) throw error;

    // Update user name if provided
    if (req.body.name) {
      await supabase.from("users").update({ name: req.body.name }).eq("id", userId);
    }

    // Get user's profile for roadmap generation
    const { data: profile } = await supabase
      .from("profiles")
      .select("skills, target_roles, headline")
      .eq("user_id", userId)
      .single();

    // Generate personalized roadmap based on profile + onboarding data
    const onboardingData = {
      career_break_years,
      last_role,
      industry,
      skills: skills || [],
      confidence: confidence || 50,
      goal,
    };
    const roadmapMilestones = generateRoadmap({ profile: profile || {}, onboarding: onboardingData });

    // Delete existing roadmap and create fresh personalized one
    await supabase.from("roadmap").delete().eq("user_id", userId);
    const roadmapItems = roadmapMilestones.map((item) => ({
      ...item,
      user_id: userId,
    }));
    await supabase.from("roadmap").insert(roadmapItems);

    // Initialize dashboard metrics based on onboarding data
    const comebackScore = calculateInitialScore(confidence, skills?.length || 0);
    await supabase
      .from("dashboard_metrics")
      .upsert({
        user_id: userId,
        comeback_score: comebackScore,
        confidence_history: [confidence || 20],
        skills_data: (skills || []).map((s) => ({ skill: s, val: Math.floor(Math.random() * 40) + 40 })),
        profile_strength: 25,
      }, { onConflict: "user_id" });

    res.status(201).json({
      message: "Onboarding completed successfully.",
      onboarding: data,
    });
  } catch (err) {
    console.error("Onboarding save error:", err);
    res.status(500).json({ error: "Failed to save onboarding data." });
  }
});

// ─── GET ONBOARDING ─────────────────────────────────────────────────────────
router.get("/", authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("onboarding")
      .select("*")
      .eq("user_id", req.user.id)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    res.json({ onboarding: data || null });
  } catch (err) {
    console.error("Get onboarding error:", err);
    res.status(500).json({ error: "Failed to fetch onboarding data." });
  }
});

// ─── UPDATE ONBOARDING ─────────────────────────────────────────────────────
router.put("/", authenticate, async (req, res) => {
  try {
    const updates = {};
    const allowed = ["career_break_years", "last_role", "industry", "skills", "confidence", "goal"];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("onboarding")
      .update(updates)
      .eq("user_id", req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "Onboarding updated.", onboarding: data });
  } catch (err) {
    console.error("Update onboarding error:", err);
    res.status(500).json({ error: "Failed to update onboarding." });
  }
});

// ─── Helper: Initial comeback score ────────────────────────────────────────
function calculateInitialScore(confidence, skillCount) {
  const confScore = (confidence || 50) * 0.4;
  const skillScore = Math.min(skillCount * 8, 40);
  const base = 20;
  return Math.min(Math.round(confScore + skillScore + base), 100);
}

module.exports = router;
