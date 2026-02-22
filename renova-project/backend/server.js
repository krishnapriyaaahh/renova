// ─── Renova Backend — Express Server ─────────────────────────────────────────
// Career Comeback Platform API
// ────────────────────────────────────────────────────────────────────────────

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

// Import routes
const authRoutes = require("./routes/auth");
const onboardingRoutes = require("./routes/onboarding");
const profileRoutes = require("./routes/profile");
const dashboardRoutes = require("./routes/dashboard");
const recommendationsRoutes = require("./routes/recommendations");
const roadmapRoutes = require("./routes/roadmap");
const communityRoutes = require("./routes/community");
const geminiRoutes = require("./routes/gemini");

// Import services
const { initGemini } = require("./services/geminiService");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────────────────────

// CORS — allow frontend requests
const allowedOrigins = [
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin === o || origin.endsWith(".vercel.app"))) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many authentication attempts. Please try again in 15 minutes." },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);

// Stricter rate limit for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: "AI rate limit reached. Please wait a moment." },
});
app.use("/api/ai/", aiLimiter);

// ─── Routes ─────────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/recommendations", recommendationsRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/ai", geminiRoutes);

// ─── Health Check ───────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Renova API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ─── API Documentation (root endpoint) ──────────────────────────────────────
app.get("/api", (req, res) => {
  res.json({
    name: "Renova API",
    version: "1.0.0",
    description: "Career Comeback Platform — REST API",
    endpoints: {
      health: "GET  /api/health",
      auth: {
        signup:  "POST /api/auth/signup",
        login:   "POST /api/auth/login",
        logout:  "POST /api/auth/logout",
        me:      "GET  /api/auth/me",
      },
      onboarding: {
        save:    "POST /api/onboarding",
        get:     "GET  /api/onboarding",
        update:  "PUT  /api/onboarding",
      },
      profile: {
        get:     "GET  /api/profile",
        update:  "PUT  /api/profile",
        resume:  "POST /api/profile/resume",
        subSections: "POST|PUT|DELETE /api/profile/{experience|education|certifications|achievements|volunteering|languages}[/:id]",
      },
      dashboard: {
        metrics:    "GET  /api/dashboard/metrics",
        update:     "PUT  /api/dashboard/metrics",
        confidence: "POST /api/dashboard/confidence",
        reminder:   "GET  /api/dashboard/reminder",
      },
      recommendations: {
        list:    "GET    /api/recommendations",
        save:    "POST   /api/recommendations/:id/save",
        unsave:  "DELETE /api/recommendations/:id/save",
        saved:   "GET    /api/recommendations/saved",
      },
      roadmap: {
        list:    "GET    /api/roadmap",
        toggle:  "PATCH  /api/roadmap/:id",
        add:     "POST   /api/roadmap",
        update:  "PUT    /api/roadmap/:id",
        delete:  "DELETE /api/roadmap/:id",
      },
      community: {
        feed:      "GET    /api/community/posts",
        create:    "POST   /api/community/posts",
        like:      "POST   /api/community/posts/:id/like",
        comments:  "GET    /api/community/posts/:id/comments",
        comment:   "POST   /api/community/posts/:id/comments",
        delete:    "DELETE /api/community/posts/:id",
      },
      ai: {
        chat:              "POST   /api/ai/chat",
        breakExplanation:  "POST   /api/ai/break-explanation",
        resumeReview:      "POST   /api/ai/resume-review",
        history:           "GET    /api/ai/history",
        clearHistory:      "DELETE /api/ai/history",
      },
    },
  });
});

// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ─── Global Error Handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: process.env.NODE_ENV === "production"
      ? "Internal server error."
      : err.message || "Internal server error.",
  });
});

// ─── Start Server ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════╗
  ║                                                  ║
  ║   🚀  Renova API Server                          ║
  ║                                                  ║
  ║   Port:        ${PORT}                              ║
  ║   Environment: ${(process.env.NODE_ENV || "development").padEnd(20)}     ║
  ║   API Docs:    http://localhost:${PORT}/api          ║
  ║   Health:      http://localhost:${PORT}/api/health   ║
  ║                                                  ║
  ╚══════════════════════════════════════════════════╝
  `);

  // Initialize Gemini AI
  const geminiReady = initGemini();
  if (geminiReady) {
    console.log("  ✓ Google Gemini AI initialized\n");
  } else {
    console.log("  ⚠ Gemini AI not configured (set GEMINI_API_KEY in .env)\n");
  }
});

module.exports = app;
