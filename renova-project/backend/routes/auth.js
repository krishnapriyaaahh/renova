// ─── Auth Routes ────────────────────────────────────────────────────────────
// POST /api/auth/signup — Register new user
// POST /api/auth/login  — Sign in existing user
// POST /api/auth/logout — Sign out (client-side token discard)
// GET  /api/auth/me     — Get current user from token
// ────────────────────────────────────────────────────────────────────────────

const express = require("express");
const bcrypt = require("bcryptjs");
const supabase = require("../config/supabase");
const { generateToken, authenticate } = require("../middleware/auth");

const router = express.Router();

// ─── SIGN UP ────────────────────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const { data: user, error } = await supabase
      .from("users")
      .insert({ name, email: email.toLowerCase(), password_hash })
      .select("id, name, email, created_at")
      .single();

    if (error) throw error;

    // Create empty profile
    await supabase.from("profiles").insert({ user_id: user.id });

    // Create default dashboard metrics
    await supabase.from("dashboard_metrics").insert({
      user_id: user.id,
      comeback_score: 0,
      confidence_history: [20],
      skills_data: [],
      apps_sent: 0,
      profile_strength: 10,
    });

    // Generate JWT
    const token = generateToken(user);

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Failed to create account." });
  }
});

// ─── LOGIN ──────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    // Find user
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, password_hash")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Compare password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Generate JWT
    const token = generateToken(user);

    res.json({
      message: "Signed in successfully.",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Failed to sign in." });
  }
});

// ─── LOGOUT ─────────────────────────────────────────────────────────────────
router.post("/logout", authenticate, (req, res) => {
  // Stateless JWT — client discards token. This endpoint exists for
  // audit logging or future token blacklisting.
  res.json({ message: "Signed out successfully." });
});

// ─── GET CURRENT USER ───────────────────────────────────────────────────────
router.get("/me", authenticate, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, avatar_url, created_at")
      .eq("id", req.user.id)
      .single();

    if (error) throw error;

    // Check if onboarding is completed
    const { data: onboarding } = await supabase
      .from("onboarding")
      .select("completed")
      .eq("user_id", req.user.id)
      .single();

    res.json({
      user,
      onboardingCompleted: onboarding?.completed || false,
    });
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ error: "Failed to fetch user data." });
  }
});

module.exports = router;
