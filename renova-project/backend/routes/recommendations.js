// ─── Recommendations Routes ─────────────────────────────────────────────────
// GET    /api/recommendations            — Get personalized job recommendations
// POST   /api/recommendations/:id/save   — Save a recommendation
// DELETE /api/recommendations/:id/save   — Unsave a recommendation
// GET    /api/recommendations/saved      — Get saved recommendations
// ────────────────────────────────────────────────────────────────────────────

const express = require("express");
const supabase = require("../config/supabase");
const { authenticate } = require("../middleware/auth");
const { generateRecommendations } = require("../services/recommendationEngine");

const router = express.Router();

// ─── GET RECOMMENDATIONS ────────────────────────────────────────────────────
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category } = req.query;

    // Get user's onboarding data for personalization
    const { data: onboarding } = await supabase
      .from("onboarding")
      .select("skills, goal, industry, last_role")
      .eq("user_id", userId)
      .single();

    // Get full profile with sub-sections
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, skills, target_roles, headline")
      .eq("user_id", userId)
      .single();

    // Get experience, education, certifications for richer matching
    let experience = [], education = [], certifications = [];
    if (profile?.id) {
      const [expRes, eduRes, certRes] = await Promise.all([
        supabase.from("experience").select("title, company").eq("profile_id", profile.id),
        supabase.from("education").select("degree, institution").eq("profile_id", profile.id),
        supabase.from("certifications").select("name, issuer").eq("profile_id", profile.id),
      ]);
      experience = expRes.data || [];
      education = eduRes.data || [];
      certifications = certRes.data || [];
    }

    // Merge skills from onboarding and profile
    const allSkills = [
      ...(onboarding?.skills || []),
      ...(profile?.skills || []),
    ];
    const uniqueSkills = [...new Set(allSkills)];

    // Generate recommendations using the rule-based engine with full profile context
    const recommendations = generateRecommendations({
      skills: uniqueSkills,
      goal: onboarding?.goal || "flexible",
      category: category || null,
      headline: profile?.headline || onboarding?.last_role || "",
      targetRoles: profile?.target_roles || [],
      experience,
      education,
      certifications,
      industry: onboarding?.industry || "",
    });

    // Get user's saved recommendations — join with recommendations table to get titles
    const { data: savedRecs } = await supabase
      .from("saved_recommendations")
      .select("recommendation_id, recommendations(title, category)")
      .eq("user_id", userId);

    // Build a lookup set of "title||category" for matching, plus a map to real UUIDs
    const savedLookup = new Set();
    const savedIdMap = {};
    (savedRecs || []).forEach((s) => {
      const rec = s.recommendations;
      if (rec) {
        const key = `${rec.title}||${rec.category}`;
        savedLookup.add(key);
        savedIdMap[key] = s.recommendation_id;
      }
    });

    // Mark saved status on each recommendation by matching title + category
    Object.keys(recommendations).forEach((cat) => {
      recommendations[cat] = recommendations[cat].map((rec) => {
        const key = `${rec.title}||${cat}`;
        return {
          ...rec,
          saved: savedLookup.has(key),
          savedId: savedIdMap[key] || null, // real UUID for unsaving
        };
      });
    });

    res.json({ recommendations });
  } catch (err) {
    console.error("Get recommendations error:", err);
    res.status(500).json({ error: "Failed to fetch recommendations." });
  }
});

// ─── SAVE RECOMMENDATION ────────────────────────────────────────────────────
router.post("/:id/save", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const roleData = req.body || {};

    // 1. Insert role snapshot into the `recommendations` table (real UUID)
    const { data: rec, error: recErr } = await supabase
      .from("recommendations")
      .insert({
        title: roleData.title || "Untitled Role",
        company: roleData.company || "Various",
        match_score: roleData.match || 0,
        skill_gaps: roleData.gap || [],
        salary: roleData.salary || "",
        work_type: roleData.type || "Remote",
        description: roleData.desc || "",
        category: roleData.category || "direct",
      })
      .select("id")
      .single();

    if (recErr) throw recErr;

    // 2. Link user ↔ recommendation in saved_recommendations
    const { error: saveErr } = await supabase
      .from("saved_recommendations")
      .upsert(
        { user_id: userId, recommendation_id: rec.id },
        { onConflict: "user_id,recommendation_id" }
      );

    if (saveErr) throw saveErr;

    res.json({ message: "Recommendation saved.", saved: true, savedId: rec.id });
  } catch (err) {
    console.error("Save recommendation error:", err);
    res.status(500).json({ error: "Failed to save recommendation." });
  }
});

// ─── UNSAVE RECOMMENDATION ──────────────────────────────────────────────────
router.delete("/:id/save", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Remove the link
    const { error } = await supabase
      .from("saved_recommendations")
      .delete()
      .eq("user_id", userId)
      .eq("recommendation_id", id);

    if (error) throw error;

    // Clean up the snapshot row in recommendations
    await supabase.from("recommendations").delete().eq("id", id).catch(() => {});

    res.json({ message: "Recommendation unsaved.", saved: false });
  } catch (err) {
    console.error("Unsave recommendation error:", err);
    res.status(500).json({ error: "Failed to unsave recommendation." });
  }
});

// ─── GET SAVED RECOMMENDATIONS ──────────────────────────────────────────────
router.get("/saved", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Join saved_recommendations → recommendations to get full role data
    const { data: saved, error } = await supabase
      .from("saved_recommendations")
      .select(`
        recommendation_id,
        created_at,
        recommendations (
          id, title, company, match_score, skill_gaps,
          salary, work_type, description, category
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform and enrich with workshops / academies
    const enriched = (saved || []).map((s) => {
      const rec = s.recommendations || {};
      const d = {
        title: rec.title || "",
        company: rec.company || "",
        match: rec.match_score || 0,
        gap: rec.skill_gaps || [],
        salary: rec.salary || "",
        type: rec.work_type || "",
        desc: rec.description || "",
        category: rec.category || "",
      };
      const domain = detectDomain(d.title.toLowerCase(), d.gap);
      return {
        recommendation_id: s.recommendation_id,
        created_at: s.created_at,
        data: d,
        workshops: generateWorkshopLinks(d.title, domain, d.gap),
        academies: generateAcademies(domain),
      };
    });

    res.json({ saved: enriched });
  } catch (err) {
    console.error("Get saved error:", err);
    res.status(500).json({ error: "Failed to fetch saved recommendations." });
  }
});

// ─── Helper: detect domain from title/skills ────────────────────────────────
function detectDomain(title, gaps) {
  const text = [title, ...(gaps || [])].join(" ").toLowerCase();
  if (/design|ux|ui|figma|visual|brand/.test(text)) return "design";
  if (/engineer|developer|react|node|python|java|code|software/.test(text)) return "engineering";
  if (/data|analytics|sql|machine learning|ml|ai|statistic/.test(text)) return "data";
  if (/market|seo|content|social|campaign|growth|brand/.test(text)) return "marketing";
  if (/health|nurs|medic|pharma|clinical|care/.test(text)) return "healthcare";
  if (/financ|account|audit|bank|invest|tax/.test(text)) return "finance";
  if (/teach|educat|tutor|curriculum|instruct|train/.test(text)) return "education";
  return "general";
}

// ─── Helper: generate real workshop/course search links ─────────────────────
function generateWorkshopLinks(roleTitle, domain, gaps) {
  const q = encodeURIComponent(roleTitle || "career skills");
  const links = [
    { name: "Coursera", icon: "coursera", url: `https://www.coursera.org/search?query=${q}` },
    { name: "LinkedIn Learning", icon: "linkedin", url: `https://www.linkedin.com/learning/search?keywords=${q}` },
    { name: "Udemy", icon: "udemy", url: `https://www.udemy.com/courses/search/?q=${q}` },
    { name: "edX", icon: "edx", url: `https://www.edx.org/search?q=${q}` },
  ];

  // Add skill-gap-specific workshops
  if (gaps && gaps.length > 0) {
    const gapQ = encodeURIComponent(gaps.slice(0, 2).join(" "));
    links.push({
      name: `Skill-Gap Workshop`,
      icon: "workshop",
      url: `https://www.coursera.org/search?query=${gapQ}`,
      note: `Focus: ${gaps.slice(0, 2).join(", ")}`,
    });
  }

  return links;
}

// ─── Helper: generate real academies / bootcamps by domain ──────────────────
function generateAcademies(domain) {
  const shared = [
    { name: "LinkedIn Learning", url: "https://www.linkedin.com/learning/", type: "Online Platform" },
  ];
  const map = {
    design: [
      { name: "Designlab", url: "https://designlab.com", type: "Online Bootcamp" },
      { name: "Interaction Design Foundation", url: "https://www.interaction-design.org", type: "Online Academy" },
      { name: "General Assembly — UX Design", url: "https://generalassemb.ly/education/ux-design-immersive", type: "Immersive Bootcamp" },
      { name: "CareerFoundry — UX/UI", url: "https://careerfoundry.com/en/courses/become-a-ux-designer/", type: "Online Bootcamp" },
    ],
    engineering: [
      { name: "freeCodeCamp", url: "https://www.freecodecamp.org", type: "Free Online" },
      { name: "The Odin Project", url: "https://www.theodinproject.com", type: "Free Online" },
      { name: "General Assembly — Software Engineering", url: "https://generalassemb.ly/education/software-engineering-immersive", type: "Immersive Bootcamp" },
      { name: "Codecademy Pro", url: "https://www.codecademy.com/pro", type: "Online Academy" },
    ],
    data: [
      { name: "DataCamp", url: "https://www.datacamp.com", type: "Online Academy" },
      { name: "Springboard — Data Science", url: "https://www.springboard.com/courses/data-science-career-track/", type: "Online Bootcamp" },
      { name: "General Assembly — Data Science", url: "https://generalassemb.ly/education/data-science-immersive", type: "Immersive Bootcamp" },
      { name: "Google Data Analytics Certificate", url: "https://grow.google/certificates/data-analytics/", type: "Certificate Program" },
    ],
    marketing: [
      { name: "Google Digital Marketing Certificate", url: "https://grow.google/certificates/digital-marketing-ecommerce/", type: "Certificate Program" },
      { name: "HubSpot Academy", url: "https://academy.hubspot.com", type: "Free Online" },
      { name: "General Assembly — Digital Marketing", url: "https://generalassemb.ly/education/digital-marketing", type: "Immersive Bootcamp" },
      { name: "CXL Institute", url: "https://cxl.com", type: "Online Academy" },
    ],
    healthcare: [
      { name: "Coursera — Public Health", url: "https://www.coursera.org/browse/health", type: "Online Courses" },
      { name: "edX — Health & Medicine", url: "https://www.edx.org/learn/health", type: "Online Courses" },
      { name: "Khan Academy — Health & Medicine", url: "https://www.khanacademy.org/science/health-and-medicine", type: "Free Online" },
    ],
    finance: [
      { name: "CFI — Corporate Finance Institute", url: "https://corporatefinanceinstitute.com", type: "Online Academy" },
      { name: "Khan Academy — Finance", url: "https://www.khanacademy.org/economics-finance-domain", type: "Free Online" },
      { name: "Coursera — Finance Specializations", url: "https://www.coursera.org/browse/business/finance", type: "Online Courses" },
    ],
    education: [
      { name: "Coursera — Education Teaching", url: "https://www.coursera.org/browse/social-sciences/education", type: "Online Courses" },
      { name: "edX — Education & Teacher Training", url: "https://www.edx.org/learn/education", type: "Online Courses" },
      { name: "Khan Academy", url: "https://www.khanacademy.org", type: "Free Online" },
    ],
    general: [
      { name: "Coursera", url: "https://www.coursera.org", type: "Online Platform" },
      { name: "edX", url: "https://www.edx.org", type: "Online Platform" },
      { name: "Skillshare", url: "https://www.skillshare.com", type: "Online Platform" },
    ],
  };
  return [...(map[domain] || map.general), ...shared];
}

module.exports = router;
