// ─── Dashboard Routes ────────────────────────────────────────────────────────
// GET  /api/dashboard/metrics   — Get dashboard metrics for current user
// PUT  /api/dashboard/metrics   — Update metrics (confidence, apps sent, etc.)
// GET  /api/dashboard/reminder  — Get daily motivational reminder
// POST /api/dashboard/confidence — Log a confidence entry
// ────────────────────────────────────────────────────────────────────────────

const express = require("express");
const supabase = require("../config/supabase");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Daily motivational reminders
const REMINDERS = [
  "Your career break is not a gap — it's a chapter. Every chapter adds depth to your story.",
  "Today, one small step. Tomorrow, momentum. You are already further along than you realise.",
  "The skills you built during your break — patience, adaptability, resilience — are exactly what teams need.",
  "Imposter syndrome means you care about doing well. That's a strength, not a weakness.",
  "Three years from now, you'll barely remember the nervousness. You'll remember the courage.",
  "Every expert was once a beginner. Every returner was once where you are right now.",
  "You don't need to be perfect. You need to be present, prepared, and authentically you.",
  "The best time to restart was yesterday. The second best time is right now.",
  "Companies that value career returners are the companies worth working for.",
  "Your unique perspective after a career break is an asset no straight-line career can replicate.",
  "Progress isn't always linear. Some days you'll leap forward, others you'll rest. Both matter.",
  "You've already done the hardest part — deciding to come back. Everything else follows.",
  "Confidence isn't feeling ready. It's starting before you feel ready.",
  "The market needs experienced professionals who've lived real life. That's you.",
];

// ─── GET DASHBOARD METRICS ──────────────────────────────────────────────────
router.get("/metrics", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get metrics
    const { data: metrics, error } = await supabase
      .from("dashboard_metrics")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code === "PGRST116") {
      // No metrics yet — create defaults
      const { data: newMetrics } = await supabase
        .from("dashboard_metrics")
        .insert({
          user_id: userId,
          comeback_score: 0,
          confidence_history: [20],
          skills_data: [],
          apps_sent: 0,
          profile_strength: 10,
        })
        .select()
        .single();

      return res.json({ metrics: formatMetrics(newMetrics) });
    }
    if (error) throw error;

    // Get roadmap progress
    const { data: roadmap } = await supabase
      .from("roadmap")
      .select("done")
      .eq("user_id", userId);

    const roadmapTotal = (roadmap || []).length;
    const roadmapDone = (roadmap || []).filter((r) => r.done).length;

    // Calculate profile strength
    const { data: profile } = await supabase
      .from("profiles")
      .select("headline, about, career_break, skills, open_to")
      .eq("user_id", userId)
      .single();

    const profileStrength = calculateProfileStrength(profile);

    res.json({
      metrics: {
        ...formatMetrics(metrics),
        roadmapProgress: { total: roadmapTotal, done: roadmapDone },
        profileStrength,
      },
    });
  } catch (err) {
    console.error("Get metrics error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard metrics." });
  }
});

// ─── UPDATE METRICS ─────────────────────────────────────────────────────────
router.put("/metrics", authenticate, async (req, res) => {
  try {
    const allowed = ["comeback_score", "apps_sent", "skills_data"];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("dashboard_metrics")
      .update(updates)
      .eq("user_id", req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "Metrics updated.", metrics: formatMetrics(data) });
  } catch (err) {
    console.error("Update metrics error:", err);
    res.status(500).json({ error: "Failed to update metrics." });
  }
});

// ─── LOG CONFIDENCE ENTRY ───────────────────────────────────────────────────
router.post("/confidence", authenticate, async (req, res) => {
  try {
    const { confidence } = req.body;
    if (confidence === undefined || confidence < 0 || confidence > 100) {
      return res.status(400).json({ error: "Confidence must be a number between 0 and 100." });
    }

    const { data: metrics } = await supabase
      .from("dashboard_metrics")
      .select("confidence_history")
      .eq("user_id", req.user.id)
      .single();

    const history = [...(metrics?.confidence_history || []), confidence];

    const { data, error } = await supabase
      .from("dashboard_metrics")
      .update({
        confidence_history: history,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "Confidence logged.", confidenceHistory: data.confidence_history });
  } catch (err) {
    console.error("Log confidence error:", err);
    res.status(500).json({ error: "Failed to log confidence." });
  }
});

// ─── GET DAILY REMINDER ─────────────────────────────────────────────────────
router.get("/reminder", authenticate, (req, res) => {
  // Use day of year as seed so everyone sees the same reminder per day
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  const index = dayOfYear % REMINDERS.length;

  res.json({ reminder: REMINDERS[index] });
});

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatMetrics(metrics) {
  if (!metrics) return null;
  return {
    comebackScore: metrics.comeback_score || 0,
    confidenceHistory: metrics.confidence_history || [20],
    skillsData: metrics.skills_data || [],
    appsSent: metrics.apps_sent || 0,
    profileStrength: metrics.profile_strength || 0,
  };
}

function calculateProfileStrength(profile) {
  if (!profile) return 10;
  let score = 10; // base
  if (profile.headline && profile.headline.length > 10) score += 15;
  if (profile.about && profile.about.length > 50) score += 20;
  if (profile.career_break && profile.career_break.length > 30) score += 20;
  if (profile.skills && profile.skills.length >= 3) score += 15;
  if (profile.skills && profile.skills.length >= 7) score += 10;
  if (profile.open_to && profile.open_to.length > 0) score += 10;
  return Math.min(score, 100);
}

module.exports = router;
