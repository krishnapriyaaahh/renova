// ─── Profile-Driven Roadmap Engine ──────────────────────────────────────────
// Generates a personalized comeback roadmap based on user's profile data:
//   - Industry / domain (from onboarding or profile)
//   - Skills + identified skill gaps
//   - Experience level + career break duration
//   - Confidence level
//   - Target roles & goals
// ────────────────────────────────────────────────────────────────────────────

const { calculateMatch } = require("./recommendationEngine");

// ─── Industry / Domain Detection ────────────────────────────────────────────
const DOMAIN_KEYWORDS = {
  design: [
    "ui", "ux", "design", "figma", "sketch", "visual", "typography",
    "illustration", "prototyping", "wireframing", "graphic", "branding",
    "creative", "adobe", "photoshop", "art director",
  ],
  engineering: [
    "software", "developer", "engineer", "react", "javascript", "python",
    "node", "frontend", "backend", "full-stack", "fullstack", "devops",
    "cloud", "mobile", "ios", "android", "java", "typescript", "golang",
    "rust", "c++", "api", "docker", "kubernetes",
  ],
  data: [
    "data", "analytics", "scientist", "machine learning", "ml", "ai",
    "statistics", "sql", "tableau", "power bi", "python", "r programming",
    "big data", "etl", "data warehouse", "business intelligence",
  ],
  marketing: [
    "marketing", "brand", "content", "seo", "social media", "copywriting",
    "campaign", "advertising", "communications", "pr", "public relations",
    "growth", "digital marketing", "email marketing",
  ],
  healthcare: [
    "healthcare", "medical", "nursing", "clinical", "hospital", "patient",
    "pharma", "health", "ehr", "telemedicine", "biotech",
  ],
  finance: [
    "finance", "accounting", "financial", "investment", "banking",
    "audit", "tax", "cpa", "budgeting", "forecasting", "risk",
  ],
  education: [
    "education", "teaching", "teacher", "professor", "curriculum",
    "instructional", "learning", "training", "academic", "school",
  ],
  operations: [
    "operations", "project management", "supply chain", "logistics",
    "procurement", "process", "quality", "lean", "six sigma",
  ],
  legal: [
    "legal", "law", "attorney", "compliance", "regulatory", "contract",
    "paralegal", "litigation",
  ],
  hr: [
    "hr", "human resources", "recruiting", "talent", "people",
    "employee relations", "payroll", "benefits",
  ],
};

/**
 * Detect the user's primary domain from their profile data
 */
function detectDomain(profile, onboarding) {
  const signals = [
    profile?.headline || "",
    ...(profile?.skills || []),
    ...(profile?.target_roles || []),
    onboarding?.last_role || "",
    onboarding?.industry || "",
    ...(onboarding?.skills || []),
  ].map(s => s.toLowerCase());

  const signalText = signals.join(" ");
  const scores = {};

  Object.entries(DOMAIN_KEYWORDS).forEach(([domain, keywords]) => {
    scores[domain] = keywords.reduce((count, kw) => {
      return count + (signalText.includes(kw) ? 1 : 0);
    }, 0);
  });

  // Return domain with highest score, or "general" if no clear match
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0][1] >= 2 ? sorted[0][0] : "general";
}

/**
 * Domain-specific skill expectations.
 * Used to identify gaps by comparing user skills against the common
 * requirements for their detected domain — no static role DB needed.
 */
const DOMAIN_CORE_SKILLS = {
  design: ["UI Design", "UX Design", "Figma", "Design Systems", "Prototyping", "User Research", "Visual Design", "Typography", "Responsive Design", "Interaction Design"],
  engineering: ["JavaScript", "React", "Node.js", "Python", "SQL", "Git", "TypeScript", "API Design", "Docker", "Agile"],
  data: ["SQL", "Python", "Data Visualization", "Statistics", "Analytics", "Tableau", "Excel", "ETL", "Machine Learning", "A/B Testing"],
  marketing: ["Content Marketing", "SEO", "Brand Strategy", "Campaign Management", "Copywriting", "Analytics", "Social Media", "Email Marketing", "Market Research", "Growth"],
  healthcare: ["Clinical Knowledge", "EHR Systems", "Patient Care", "Data Analysis", "Research", "Regulatory Compliance", "HIPAA", "Telemedicine", "Medical Terminology", "Quality Assurance"],
  finance: ["Financial Analysis", "Excel", "Financial Modeling", "Accounting", "SQL", "Budgeting", "Forecasting", "Risk Management", "Audit", "Tax"],
  education: ["Curriculum Design", "Teaching", "LMS", "Content Creation", "Assessment Design", "Instructional Design", "Training", "E-Learning", "Public Speaking", "Mentoring"],
  operations: ["Project Management", "Process Improvement", "Agile", "Jira", "Lean", "Six Sigma", "Supply Chain", "KPI Frameworks", "Change Management", "Leadership"],
  legal: ["Compliance", "Contract Management", "Regulatory Affairs", "Legal Research", "Risk Assessment", "Litigation", "Negotiation", "IP", "Privacy Law", "Legal Writing"],
  hr: ["Recruiting", "Talent Management", "Employee Relations", "Payroll", "Performance Management", "HRIS", "Onboarding", "Benefits Administration", "Labor Law", "DEI"],
  general: ["Project Management", "Communication", "Analytics", "Leadership", "Strategy", "Stakeholder Management", "Excel", "Problem-Solving", "Agile", "Data Analysis"],
};

/**
 * Identify skill gaps by comparing user skills against the core skills
 * expected in their detected domain.
 */
function identifySkillGaps(skills, goal, domain) {
  const domainToUse = domain || "general";
  const coreSkills = DOMAIN_CORE_SKILLS[domainToUse] || DOMAIN_CORE_SKILLS.general;
  const normalizedUser = (skills || []).map(s => s.toLowerCase().trim());

  const gaps = [];
  coreSkills.forEach(core => {
    const low = core.toLowerCase();
    const found = normalizedUser.some(us =>
      us === low || us.includes(low) || low.includes(us)
    );
    if (!found) gaps.push(core);
  });

  return gaps.slice(0, 5);
}

/**
 * Parse career break duration to rough months
 */
function parseBreakMonths(breakYears) {
  if (!breakYears) return 12; // default assumption
  const lower = breakYears.toLowerCase();
  if (lower.includes("under 1") || lower.includes("< 1")) return 6;
  if (lower.includes("1–2") || lower.includes("1-2")) return 18;
  if (lower.includes("2–4") || lower.includes("2-4")) return 36;
  if (lower.includes("4–6") || lower.includes("4-6")) return 60;
  if (lower.includes("6+") || lower.includes("6 +")) return 84;
  return 12;
}

// ─── Domain-Specific Milestone Templates ────────────────────────────────────
// Each returns an array of { title, description, week }
// Placeholders: {TARGET_ROLE}, {SKILL_GAP_1}, {SKILL_GAP_2}, {INDUSTRY}

const DOMAIN_MILESTONES = {
  design: [
    { title: "Refresh your design portfolio", description: "Curate 3-5 of your strongest projects. Rewrite case studies to show process, decisions, and outcomes — not just visuals.", week: "Week 1" },
    { title: "Update your design tools", description: "Spend time with the latest version of Figma (or your primary tool). Explore auto layout, variables, and dev mode.", week: "Week 1" },
    { title: "Complete a design refresher course", description: "Take a focused course on {SKILL_GAP_1} — this is the most common gap for your target roles.", week: "Week 2" },
    { title: "Redesign a real product screen", description: "Pick an app you use daily and redesign one flow. Document your thinking as a mini case study for your portfolio.", week: "Week 2" },
    { title: "Build or refine your design system", description: "Create a small component library that demonstrates your systems thinking — tokens, components, documentation.", week: "Week 3" },
    { title: "Join design community events", description: "Attend a local or virtual design meetup. Reconnect with the design community and stay current on trends.", week: "Week 3" },
  ],
  engineering: [
    { title: "Rebuild your coding environment", description: "Set up your dev machine with current tools, frameworks, and extensions. Push a fresh repo to GitHub.", week: "Week 1" },
    { title: "Complete a hands-on coding refresher", description: "Spend 2-3 hours on a focused tutorial covering {SKILL_GAP_1} — your most impactful skill gap.", week: "Week 1" },
    { title: "Build a portfolio project", description: "Create a small but complete project that demonstrates your {SKILL_GAP_1} and {SKILL_GAP_2} skills. Deploy it live.", week: "Week 2" },
    { title: "Contribute to open source", description: "Find a beginner-friendly issue on GitHub in a project you use. Even a documentation fix shows you're active.", week: "Week 2-3" },
    { title: "Practice technical interview patterns", description: "Solve 10-15 problems on LeetCode or similar. Focus on patterns, not memorization.", week: "Week 3" },
    { title: "Learn current best practices", description: "Read up on the latest in {SKILL_GAP_2} — the industry has evolved and interviewers will ask about modern approaches.", week: "Week 3-4" },
  ],
  data: [
    { title: "Set up your analytics environment", description: "Install Python, Jupyter, and key libraries (pandas, scikit-learn). Run through a quick EDA on a public dataset.", week: "Week 1" },
    { title: "Refresh your SQL skills", description: "Complete 20 SQL challenges on StrataScratch or LeetCode. Focus on window functions and CTEs.", week: "Week 1" },
    { title: "Build an end-to-end data project", description: "Pick a real dataset, clean it, analyze it, and build a dashboard or notebook. This becomes your portfolio piece.", week: "Week 2" },
    { title: "Learn {SKILL_GAP_1}", description: "This is the most common gap for your target roles. Take a structured course and build a small project.", week: "Week 2-3" },
    { title: "Practice case study interviews", description: "Data roles often have case interviews. Practice structuring analyses and presenting findings clearly.", week: "Week 3" },
    { title: "Get a relevant certification", description: "Consider Google Data Analytics Certificate or similar — it signals current knowledge to recruiters.", week: "Week 3-4" },
  ],
  marketing: [
    { title: "Audit your personal brand", description: "Update LinkedIn with your career break narrative framed as growth. Your story is an asset, not a gap.", week: "Week 1" },
    { title: "Learn current marketing tools", description: "Spend time with {SKILL_GAP_1} — the marketing tech stack has evolved. Hands-on practice matters.", week: "Week 1" },
    { title: "Create a strategy case study", description: "Pick a brand you admire and write a mock marketing strategy. This demonstrates current thinking to recruiters.", week: "Week 2" },
    { title: "Build a content portfolio", description: "Write 2-3 pieces of content (blog posts, social campaigns) that showcase your expertise in your target niche.", week: "Week 2-3" },
    { title: "Reconnect with your network", description: "Reach out to 5 former colleagues with a genuine re-introduction. Share what you've been learning.", week: "Week 3" },
    { title: "Explore {SKILL_GAP_2} fundamentals", description: "This skill appears frequently in your target roles. Even basic familiarity will set you apart.", week: "Week 3-4" },
  ],
  healthcare: [
    { title: "Verify and renew certifications", description: "Check that all your professional certifications and licenses are current. Begin renewal if needed.", week: "Week 1" },
    { title: "Review updated clinical guidelines", description: "Catch up on changes in protocols, EHR systems, and regulatory requirements in your specialty.", week: "Week 1-2" },
    { title: "Complete a continuing education module", description: "Take a focused CE course in {SKILL_GAP_1} — this keeps your skills sharp and your credentials valid.", week: "Week 2" },
    { title: "Shadow or volunteer in a clinical setting", description: "Even a few days helps you reconnect with the pace and build confidence before formal interviews.", week: "Week 2-3" },
    { title: "Update your healthcare resume", description: "Highlight patient outcomes, certifications, and transferable skills like leadership and process improvement.", week: "Week 3" },
    { title: "Research health tech opportunities", description: "Your clinical knowledge is valuable in health tech, informatics, and telehealth — explore adjacent paths.", week: "Week 3-4" },
  ],
  finance: [
    { title: "Refresh financial modeling skills", description: "Rebuild a DCF model or financial forecast from scratch. Use current tools and Excel best practices.", week: "Week 1" },
    { title: "Update regulatory knowledge", description: "Review changes in accounting standards, tax codes, or financial regulations since your career break.", week: "Week 1-2" },
    { title: "Learn {SKILL_GAP_1}", description: "This skill gap appears most frequently in your target roles. Even foundational knowledge makes a difference.", week: "Week 2" },
    { title: "Get a relevant certification", description: "Consider CFA prep, CPA renewal, or a FinTech certificate — signals commitment to staying current.", week: "Week 2-3" },
    { title: "Build a financial analysis portfolio", description: "Create 2-3 sample analyses (market research, valuation, budget forecast) in a clean presentation format.", week: "Week 3" },
    { title: "Network with finance professionals", description: "Attend a virtual finance meetup or reconnect with former colleagues. The finance world runs on relationships.", week: "Week 3-4" },
  ],
  education: [
    { title: "Explore current EdTech platforms", description: "Familiarize yourself with modern LMS platforms, virtual classroom tools, and AI in education.", week: "Week 1" },
    { title: "Refresh your teaching portfolio", description: "Update lesson plans, student outcomes data, and teaching philosophy statement.", week: "Week 1-2" },
    { title: "Take a professional development course", description: "Focus on {SKILL_GAP_1} — the education landscape has shifted and this skill will be expected.", week: "Week 2" },
    { title: "Design a sample curriculum module", description: "Create a polished sample lesson or course module that showcases your expertise and modern pedagogy.", week: "Week 2-3" },
    { title: "Explore corporate L&D opportunities", description: "Your teaching skills are highly valued in corporate training, instructional design, and L&D roles.", week: "Week 3" },
    { title: "Volunteer or guest lecture", description: "Offer to guest-teach a class or workshop — rebuilds confidence and generates a fresh reference.", week: "Week 3-4" },
  ],
  general: [
    { title: "Define your target role clearly", description: "Research 5 job listings that excite you. Note common requirements and how your experience maps to them.", week: "Week 1" },
    { title: "Audit and update your skills", description: "Identify your top transferable skills and 2-3 gaps to address. Focus on the ones that appear in your target roles.", week: "Week 1" },
    { title: "Learn {SKILL_GAP_1}", description: "This is the most impactful skill gap for your target roles. Start with a beginner-friendly course.", week: "Week 2" },
    { title: "Build a portfolio or work sample", description: "Create something tangible that demonstrates your ability — a project, analysis, or case study.", week: "Week 2-3" },
    { title: "Explore {SKILL_GAP_2}", description: "This skill appears frequently in adjacent roles and could open new opportunities.", week: "Week 3" },
    { title: "Practice your career break narrative", description: "Write and rehearse a 30-second story about your break that frames it as growth, not a gap.", week: "Week 3-4" },
  ],
  operations: [
    { title: "Map your process improvement wins", description: "Document 3-5 concrete examples where you improved efficiency, cut costs, or streamlined operations.", week: "Week 1" },
    { title: "Update your project management toolkit", description: "Familiarize yourself with current tools — Jira, Asana, Monday.com. Get comfortable with agile workflows.", week: "Week 1-2" },
    { title: "Get certified in {SKILL_GAP_1}", description: "Certifications carry weight in operations roles. Consider PMP, Lean Six Sigma, or Agile.", week: "Week 2" },
    { title: "Build an operations case study", description: "Create a detailed write-up of a process improvement you led — metrics, methodology, and results.", week: "Week 2-3" },
    { title: "Learn data-driven operations", description: "Operations is increasingly data-driven. Refresh your Excel, SQL, or analytics skills.", week: "Week 3" },
    { title: "Network in operations communities", description: "Join PMI local chapter, Operations Management Society, or LinkedIn ops groups.", week: "Week 3-4" },
  ],
};

// ─── Shared / Universal Milestones ──────────────────────────────────────────
const SHARED_MILESTONES = {
  linkedin: { title: "Update your LinkedIn profile", description: "Rewrite your headline to reflect your target role. Add your career break with a confident, authentic narrative.", week: "Week 1" },
  resume: { title: "Tailor your resume for target roles", description: "Rewrite your resume highlighting transferable skills and quantified achievements. Customize for each application.", week: "Week 2" },
  network: { title: "Reconnect with your professional network", description: "Reach out to 5 former colleagues or mentors. Share your comeback story and what you're looking for.", week: "Week 2-3" },
  apply: { title: "Apply to your first target roles", description: "Submit 3 carefully tailored applications. Quality over volume — each one should feel intentional.", week: "Week 3-4" },
  interview: { title: "Prepare for interviews", description: "Practice your career break narrative, STAR-format answers, and role-specific questions. Use mock interviews.", week: "Week 4" },
  celebrate: { title: "Celebrate your progress", description: "You've rebuilt skills, expanded your network, and taken real action. This milestone exists because you deserve to acknowledge it.", week: "Week 5+" },
  confidence: { title: "Daily confidence journaling", description: "Spend 5 minutes each morning writing what makes you qualified. Combat imposter syndrome with evidence.", week: "Ongoing" },
};

// Extended break = more ramp-up milestones
const EXTENDED_BREAK_MILESTONES = [
  { title: "Reacclimatize to workplace culture", description: "Read about current workplace trends — remote/hybrid norms, communication tools (Slack, Teams), meeting culture.", week: "Week 1" },
  { title: "Build daily work routines", description: "Start structuring your days like a workday — focused blocks, breaks, and a consistent schedule. Rebuilds stamina.", week: "Week 1-2" },
];

// Low confidence = more support milestones
const CONFIDENCE_MILESTONES = [
  { title: "Join a comeback support community", description: "Connect with others on the same journey. Renova's community, Path Forward, or Reboot are great places to start.", week: "Week 1" },
  { title: "Identify your career break superpowers", description: "List 5 skills you developed during your break — patience, adaptability, problem-solving. These are genuine strengths.", week: "Week 1" },
];

// ─── Main Generator ─────────────────────────────────────────────────────────
/**
 * Generate a personalized comeback roadmap
 * @param {object} params
 * @param {object} params.profile — from profiles table (skills, target_roles, headline, etc.)
 * @param {object} params.onboarding — from onboarding table (industry, last_role, confidence, goal, career_break_years)
 * @returns {Array<{title, description, week, sort_order}>}
 */
function generateRoadmap({ profile, onboarding }) {
  const milestones = [];
  let sortOrder = 1;

  // 1. Detect domain
  const domain = detectDomain(profile, onboarding);

  // 2. Merge all skills
  const allSkills = [
    ...(profile?.skills || []),
    ...(onboarding?.skills || []),
  ];
  const uniqueSkills = [...new Set(allSkills)];

  // 3. Identify skill gaps
  const goal = onboarding?.goal || "flexible";
  const skillGaps = identifySkillGaps(uniqueSkills, goal, domain);

  // 4. Parse break duration
  const breakMonths = parseBreakMonths(onboarding?.career_break_years);
  const confidence = onboarding?.confidence || 50;

  // ─── Build milestone list ───────────────────────────────────────────────

  // A. LinkedIn update (universal, always first)
  milestones.push({ ...SHARED_MILESTONES.linkedin, sort_order: sortOrder++ });

  // B. Extended break milestones (if > 3 years)
  if (breakMonths > 36) {
    EXTENDED_BREAK_MILESTONES.forEach(m => {
      milestones.push({ ...m, sort_order: sortOrder++ });
    });
  }

  // C. Low confidence support (if < 40)
  if (confidence < 40) {
    CONFIDENCE_MILESTONES.forEach(m => {
      milestones.push({ ...m, sort_order: sortOrder++ });
    });
  }

  // D. Domain-specific milestones (the core of the roadmap)
  const domainMilestones = DOMAIN_MILESTONES[domain] || DOMAIN_MILESTONES.general;
  domainMilestones.forEach(m => {
    // Replace placeholders
    let title = m.title;
    let description = m.description;
    const targetRole = (profile?.target_roles?.[0]) || onboarding?.last_role || "your target role";
    const industry = onboarding?.industry || "your industry";

    title = title.replace("{TARGET_ROLE}", targetRole).replace("{INDUSTRY}", industry);
    description = description.replace("{TARGET_ROLE}", targetRole).replace("{INDUSTRY}", industry);

    if (skillGaps[0]) {
      title = title.replace("{SKILL_GAP_1}", skillGaps[0]);
      description = description.replace("{SKILL_GAP_1}", skillGaps[0]);
    } else {
      title = title.replace("{SKILL_GAP_1}", "a relevant new skill");
      description = description.replace("{SKILL_GAP_1}", "a relevant new skill");
    }
    if (skillGaps[1]) {
      title = title.replace("{SKILL_GAP_2}", skillGaps[1]);
      description = description.replace("{SKILL_GAP_2}", skillGaps[1]);
    } else {
      title = title.replace("{SKILL_GAP_2}", "an emerging skill in your field");
      description = description.replace("{SKILL_GAP_2}", "an emerging skill in your field");
    }

    milestones.push({ title, description, week: m.week, sort_order: sortOrder++ });
  });

  // E. Resume + Networking + Application milestones (universal)
  milestones.push({ ...SHARED_MILESTONES.resume, sort_order: sortOrder++ });
  milestones.push({ ...SHARED_MILESTONES.network, sort_order: sortOrder++ });
  milestones.push({ ...SHARED_MILESTONES.apply, sort_order: sortOrder++ });

  // F. Interview prep
  milestones.push({ ...SHARED_MILESTONES.interview, sort_order: sortOrder++ });

  // G. Confidence journaling (if < 60)
  if (confidence < 60) {
    milestones.push({ ...SHARED_MILESTONES.confidence, sort_order: sortOrder++ });
  }

  // H. Celebration (always last)
  milestones.push({ ...SHARED_MILESTONES.celebrate, sort_order: sortOrder++ });

  return milestones.map(m => ({
    title: m.title,
    description: m.description,
    week: m.week,
    sort_order: m.sort_order,
    done: false,
  }));
}

module.exports = { generateRoadmap, detectDomain, identifySkillGaps };
