// ─── Gemini AI Routes ────────────────────────────────────────────────────────
// POST /api/ai/chat                — Chat with AI career coach
// POST /api/ai/break-explanation   — Generate career break explanations
// POST /api/ai/resume-review       — Analyze and score a resume
// GET  /api/ai/history             — Get chat history
// DELETE /api/ai/history           — Clear chat history
// ────────────────────────────────────────────────────────────────────────────

const express = require("express");
const supabase = require("../config/supabase");
const { authenticate } = require("../middleware/auth");
const {
  generateResponse,
  generateBreakExplanation,
  analyzeResume,
} = require("../services/geminiService");

const router = express.Router();

// ─── CHAT WITH AI ───────────────────────────────────────────────────────────
router.post("/chat", authenticate, async (req, res) => {
  try {
    const { message, context = "general" } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required." });
    }

    const userId = req.user.id;

    // Get user's profile context for personalization
    const [onboardingRes, profileRes, historyRes] = await Promise.all([
      supabase.from("onboarding").select("skills, goal, career_break_years, last_role").eq("user_id", userId).single(),
      supabase.from("profiles").select("skills, about, career_break").eq("user_id", userId).single(),
      supabase.from("ai_conversations").select("role, message").eq("user_id", userId).eq("context", context).order("created_at", { ascending: true }).limit(20),
    ]);

    const userProfile = {
      name: req.user.name,
      skills: [...(onboardingRes.data?.skills || []), ...(profileRes.data?.skills || [])],
      goal: onboardingRes.data?.goal,
      career_break_years: onboardingRes.data?.career_break_years,
      last_role: onboardingRes.data?.last_role,
    };

    // Generate AI response
    const aiResponse = await generateResponse({
      message: message.trim(),
      context,
      history: historyRes.data || [],
      userProfile,
    });

    // Save conversation to history
    await supabase.from("ai_conversations").insert([
      { user_id: userId, role: "user", message: message.trim(), context },
      { user_id: userId, role: "assistant", message: aiResponse, context },
    ]);

    res.json({
      response: aiResponse,
      context,
    });
  } catch (err) {
    console.error("AI chat error:", err);
    res.status(500).json({ error: "Failed to generate AI response." });
  }
});

// ─── GENERATE CAREER BREAK EXPLANATION ──────────────────────────────────────
router.post("/break-explanation", authenticate, async (req, res) => {
  try {
    const { breakReason, duration } = req.body;

    // Get user's skills
    const { data: onboarding } = await supabase
      .from("onboarding")
      .select("skills")
      .eq("user_id", req.user.id)
      .single();

    const explanation = await generateBreakExplanation({
      breakReason,
      duration,
      skills: onboarding?.skills || [],
    });

    res.json({ explanation });
  } catch (err) {
    console.error("Break explanation error:", err);
    res.status(500).json({ error: "Failed to generate explanation." });
  }
});

// ─── RESUME REVIEW ──────────────────────────────────────────────────────────
router.post("/resume-review", authenticate, async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ error: "Resume text is required." });
    }

    // Get user context
    const { data: onboarding } = await supabase
      .from("onboarding")
      .select("skills, goal, last_role, industry")
      .eq("user_id", req.user.id)
      .single();

    const review = await analyzeResume(resumeText.trim(), {
      name: req.user.name,
      skills: onboarding?.skills || [],
      goal: onboarding?.goal,
      lastRole: onboarding?.last_role,
      industry: onboarding?.industry,
    });

    res.json({ review });
  } catch (err) {
    console.error("Resume review error:", err);
    res.status(500).json({ error: "Failed to review resume." });
  }
});

// ─── GET CHAT HISTORY ───────────────────────────────────────────────────────
router.get("/history", authenticate, async (req, res) => {
  try {
    const { context = "general", limit = 50 } = req.query;

    const { data, error } = await supabase
      .from("ai_conversations")
      .select("id, role, message, context, created_at")
      .eq("user_id", req.user.id)
      .eq("context", context)
      .order("created_at", { ascending: true })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json({ history: data || [] });
  } catch (err) {
    console.error("Get history error:", err);
    res.status(500).json({ error: "Failed to fetch chat history." });
  }
});

// ─── CLEAR CHAT HISTORY ────────────────────────────────────────────────────
router.delete("/history", authenticate, async (req, res) => {
  try {
    const { context } = req.query;

    let query = supabase.from("ai_conversations").delete().eq("user_id", req.user.id);
    if (context) query = query.eq("context", context);

    const { error } = await query;
    if (error) throw error;

    res.json({ message: "Chat history cleared." });
  } catch (err) {
    console.error("Clear history error:", err);
    res.status(500).json({ error: "Failed to clear chat history." });
  }
});

module.exports = router;
