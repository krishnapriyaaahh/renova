// ─── Profile Routes ─────────────────────────────────────────────────────────
// GET    /api/profile                     — Get full profile with all sub-sections
// PUT    /api/profile                     — Update profile top-level fields
// POST   /api/profile/experience          — Add experience entry
// PUT    /api/profile/experience/:id      — Update experience entry
// DELETE /api/profile/experience/:id      — Remove experience entry
// POST   /api/profile/education           — Add education entry
// PUT    /api/profile/education/:id       — Update education entry
// DELETE /api/profile/education/:id       — Remove education entry
// POST   /api/profile/certifications      — Add certification
// DELETE /api/profile/certifications/:id  — Remove certification
// POST   /api/profile/achievements        — Add achievement
// DELETE /api/profile/achievements/:id    — Remove achievement
// POST   /api/profile/volunteering        — Add volunteering entry
// DELETE /api/profile/volunteering/:id    — Remove volunteering entry
// POST   /api/profile/languages           — Add language
// DELETE /api/profile/languages/:id       — Remove language
// POST   /api/profile/resume              — Upload resume file
// ────────────────────────────────────────────────────────────────────────────

const express = require("express");
const multer = require("multer");
const path = require("path");
const supabase = require("../config/supabase");
const { authenticate } = require("../middleware/auth");
const { analyzeResume } = require("../services/geminiService");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB limit

// Helper: upload file to Supabase Storage, return public URL
async function uploadToSupabase(bucket, subDir, userId, file) {
  const ext = path.extname(file.originalname) || ".bin";
  const fileName = `${subDir}/${userId}-${Date.now()}${ext}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return urlData.publicUrl;
}

// Helper: get banner URL from profiles table
async function getBannerData(userId) {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("banner_url")
      .eq("user_id", userId)
      .single();
    return data?.banner_url ? { banner_url: data.banner_url } : null;
  } catch {
    return null;
  }
}

// ─── GET FULL PROFILE ───────────────────────────────────────────────────────
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code === "PGRST116") {
      // Profile not found — create one
      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({ user_id: userId })
        .select()
        .single();
      return res.json({ profile: { ...newProfile, experience: [], education: [], certifications: [], achievements: [], volunteering: [], languages: [] } });
    }
    if (error) throw error;

    // Fetch all sub-sections in parallel
    const [experience, education, certifications, achievements, volunteering, languages] =
      await Promise.all([
        supabase.from("experience").select("*").eq("profile_id", profile.id).order("sort_order"),
        supabase.from("education").select("*").eq("profile_id", profile.id).order("sort_order"),
        supabase.from("certifications").select("*").eq("profile_id", profile.id).order("sort_order"),
        supabase.from("achievements").select("*").eq("profile_id", profile.id).order("sort_order"),
        supabase.from("volunteering").select("*").eq("profile_id", profile.id).order("sort_order"),
        supabase.from("languages").select("*").eq("profile_id", profile.id).order("sort_order"),
      ]);

    // Get user name + avatar
    const { data: user } = await supabase.from("users").select("name, email, avatar_url").eq("id", userId).single();

    // Get banner data from profiles table
    const bannerData = await getBannerData(userId);

    res.json({
      profile: {
        ...profile,
        name: user?.name || "",
        email: user?.email || "",
        avatar_url: user?.avatar_url || "",
        banner_url: bannerData?.banner_url || "",
        experience: experience.data || [],
        education: education.data || [],
        certifications: certifications.data || [],
        achievements: achievements.data || [],
        volunteering: volunteering.data || [],
        languages: languages.data || [],
      },
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Failed to fetch profile." });
  }
});

// ─── UPDATE PROFILE TOP-LEVEL FIELDS ────────────────────────────────────────
router.put("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const allowed = [
      "headline", "location", "website", "about", "career_break",
      "skills", "open_to", "target_roles", "banner_index",
    ];

    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    updates.updated_at = new Date().toISOString();

    // Try update first
    let { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    // If no profile row exists, create one (upsert)
    if (error && (error.code === "PGRST116" || !data)) {
      const insert = { user_id: userId, ...updates };
      const result = await supabase
        .from("profiles")
        .insert(insert)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) throw error;

    // Update user name if provided
    if (req.body.name) {
      await supabase.from("users").update({ name: req.body.name }).eq("id", userId);
    }

    res.json({ message: "Profile updated.", profile: data });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Failed to update profile." });
  }
});

// ─── CRUD HELPERS for sub-sections ──────────────────────────────────────────
function subSectionRoutes(table, fields) {
  const subRouter = express.Router();

  // ADD
  subRouter.post("/", authenticate, async (req, res) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", req.user.id)
        .single();

      if (!profile) return res.status(404).json({ error: "Profile not found." });

      const entry = { profile_id: profile.id };
      fields.forEach((f) => {
        if (req.body[f] !== undefined) entry[f] = req.body[f];
      });

      const { data, error } = await supabase
        .from(table)
        .insert(entry)
        .select()
        .single();

      if (error) throw error;
      res.status(201).json({ message: `${table} entry added.`, data });
    } catch (err) {
      console.error(`Add ${table} error:`, err);
      res.status(500).json({ error: `Failed to add ${table} entry.` });
    }
  });

  // UPDATE
  subRouter.put("/:id", authenticate, async (req, res) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", req.user.id)
        .single();

      if (!profile) return res.status(404).json({ error: "Profile not found." });

      const updates = {};
      fields.forEach((f) => {
        if (req.body[f] !== undefined) updates[f] = req.body[f];
      });

      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq("id", req.params.id)
        .eq("profile_id", profile.id)
        .select()
        .single();

      if (error) throw error;
      res.json({ message: `${table} entry updated.`, data });
    } catch (err) {
      console.error(`Update ${table} error:`, err);
      res.status(500).json({ error: `Failed to update ${table} entry.` });
    }
  });

  // DELETE
  subRouter.delete("/:id", authenticate, async (req, res) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", req.user.id)
        .single();

      if (!profile) return res.status(404).json({ error: "Profile not found." });

      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", req.params.id)
        .eq("profile_id", profile.id);

      if (error) throw error;
      res.json({ message: `${table} entry removed.` });
    } catch (err) {
      console.error(`Delete ${table} error:`, err);
      res.status(500).json({ error: `Failed to delete ${table} entry.` });
    }
  });

  return subRouter;
}

// Mount sub-section routes
router.use("/experience", subSectionRoutes("experience", ["title", "company", "location", "start_date", "end_date", "is_current", "description", "sort_order"]));
router.use("/education", subSectionRoutes("education", ["institution", "degree", "years", "grade", "sort_order"]));
router.use("/certifications", subSectionRoutes("certifications", ["name", "issuer", "year", "sort_order"]));
router.use("/achievements", subSectionRoutes("achievements", ["title", "org", "year", "description", "sort_order"]));
router.use("/volunteering", subSectionRoutes("volunteering", ["org", "role", "years", "description", "sort_order"]));
router.use("/languages", subSectionRoutes("languages", ["name", "level", "sort_order"]));

// ─── RESUME UPLOAD ──────────────────────────────────────────────────────────
router.post("/resume", authenticate, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });
    const fileUrl = await uploadToSupabase("uploads", "resumes", req.user.id, req.file);
    await supabase.from("profiles").update({ resume_url: fileUrl }).eq("user_id", req.user.id);
    res.json({ message: "Resume uploaded.", resume_url: fileUrl });
  } catch (err) {
    console.error("Resume upload error:", err);
    res.status(500).json({ error: "Failed to upload resume." });
  }
});

// ─── AVATAR UPLOAD ──────────────────────────────────────────────────────────
router.post("/avatar", authenticate, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });
    const avatarUrl = await uploadToSupabase("uploads", "avatars", req.user.id, req.file);
    // Store in users table (which has avatar_url column)
    await supabase.from("users").update({ avatar_url: avatarUrl }).eq("id", req.user.id);
    res.json({ message: "Avatar uploaded.", avatar_url: avatarUrl });
  } catch (err) {
    console.error("Avatar upload error:", err);
    res.status(500).json({ error: "Failed to upload avatar." });
  }
});

// ─── BANNER IMAGE UPLOAD ────────────────────────────────────────────────────
router.post("/banner", authenticate, upload.single("banner"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });
    const bannerUrl = await uploadToSupabase("uploads", "banners", req.user.id, req.file);
    // Store banner URL in profiles table + set banner_index to -1 for custom image
    await supabase.from("profiles").update({ banner_url: bannerUrl, banner_index: -1 }).eq("user_id", req.user.id);
    res.json({ message: "Banner uploaded.", banner_url: bannerUrl });
  } catch (err) {
    console.error("Banner upload error:", err);
    res.status(500).json({ error: "Failed to upload banner." });
  }
});

// ─── CV UPLOAD + AI ANALYSIS ────────────────────────────────────────────────
router.post("/cv-analyze", authenticate, upload.single("cv"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No CV file uploaded." });

    const userId = req.user.id;
    const fileUrl = await uploadToSupabase("uploads", "resumes", userId, req.file);

    // Update profile resume_url
    await supabase.from("profiles").update({ resume_url: fileUrl }).eq("user_id", userId);

    // Extract text from the file buffer for analysis
    const cvText = req.file.buffer.toString("utf-8");

    // Get user context for personalized analysis
    const { data: onboarding } = await supabase
      .from("onboarding")
      .select("skills, goal, last_role, industry")
      .eq("user_id", userId)
      .single();

    // Run AI analysis
    const review = await analyzeResume(cvText, {
      name: req.user.name,
      skills: onboarding?.skills || [],
      goal: onboarding?.goal,
      lastRole: onboarding?.last_role,
      industry: onboarding?.industry,
    });

    // Try to store analysis in cv_analysis table (ignore if table doesn't exist yet)
    try {
      const analysisRow = {
        user_id: userId,
        file_name: req.file.originalname,
        file_url: fileUrl,
        score: review.score || 0,
        rating: review.rating || "Good",
        overall_chance: review.overall_chance || 0,
        category_scores: review.category_scores || {},
        strengths: review.strengths || [],
        improvements: review.improvements || [],
        keywords: review.keywords || [],
        missing_keywords: review.missing_keywords || [],
        suggestion: review.suggestion || "",
        summary: review.summary || "",
        ats_friendly: review.ats_friendly ?? true,
        experience_level: review.experience_level || "Unknown",
        analyzed_at: new Date().toISOString(),
      };
      const { data: existing } = await supabase.from("cv_analysis").select("id").eq("user_id", userId).single();
      if (existing) {
        await supabase.from("cv_analysis").update(analysisRow).eq("user_id", userId);
      } else {
        await supabase.from("cv_analysis").insert(analysisRow);
      }
    } catch (dbErr) {
      console.warn("cv_analysis table not available, skipping DB save:", dbErr.message);
    }

    res.json({
      message: "CV uploaded and analyzed.",
      file_url: fileUrl,
      file_name: req.file.originalname,
      analysis: review,
    });
  } catch (err) {
    console.error("CV analysis error:", err);
    res.status(500).json({ error: "Failed to analyze CV." });
  }
});

// ─── GET CV ANALYSIS ────────────────────────────────────────────────────────
router.get("/cv-analysis", authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("cv_analysis")
      .select("*")
      .eq("user_id", req.user.id)
      .single();

    if (error) {
      // Table doesn't exist or no row found — both return null
      return res.json({ analysis: null });
    }

    res.json({ analysis: data });
  } catch (err) {
    // If cv_analysis table doesn't exist at all, just return null
    console.warn("Get CV analysis — table may not exist:", err.message);
    res.json({ analysis: null });
  }
});

module.exports = router;
