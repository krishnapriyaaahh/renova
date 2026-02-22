// ─── Dynamic Recommendation Engine ─────────────────────────────────────────
// Generates personalized job recommendations purely from the user's profile.
// NO hardcoded dummy roles — every result is built from the user's own skills,
// experience, target roles, education, and career goals.
// ────────────────────────────────────────────────────────────────────────────

// ─── Domain Templates ───────────────────────────────────────────────────────
const DOMAIN_MAP = {
  design: {
    keywords: ["ui", "ux", "design", "figma", "sketch", "visual", "typography",
      "illustration", "prototyping", "wireframing", "graphic", "branding",
      "creative", "adobe", "photoshop", "art director", "product design",
      "interaction design"],
    directTemplates: [
      { titleFn: (c) => `Senior ${c.primaryRole}`, descFn: (c) => `Continue your career as a ${c.primaryRole}. Your ${c.topSkills} experience maps directly to this role.` },
      { titleFn: (c) => `${c.primaryRole} (${c.workType})`, descFn: (c) => `A ${c.workType.toLowerCase()} position leveraging your ${c.topSkills} expertise.` },
      { titleFn: (c) => `Lead ${c.primaryRole}`, descFn: (c) => `Step into leadership driving design strategy with your ${c.yearsText} experience.` },
      { titleFn: (c) => `${c.primaryRole} II`, descFn: (c) => `Mid-senior hands-on ${c.topSkills} role with room to grow into leadership.` },
    ],
    adjacentTemplates: [
      { titleFn: () => "UX Researcher", skills: ["User Research", "Usability Testing", "Data Analysis"], gapSkills: ["Quantitative Research", "A/B Testing", "Survey Design"], descFn: (c) => `Your ${c.topSkills} background gives you strong user empathy — the most critical UX research skill.` },
      { titleFn: () => "Design Program Manager", skills: ["Project Management", "Design Systems", "Stakeholder Communication"], gapSkills: ["Program Management", "Agile/Scrum", "Roadmap Planning"], descFn: (c) => `Bridge design and operations. Your ${c.topSkills} domain expertise is invaluable.` },
      { titleFn: () => "Front-End Developer", skills: ["HTML", "CSS", "JavaScript", "Responsive Design"], gapSkills: ["React/Vue", "JavaScript", "Git"], descFn: () => `Bring designs to life in code. Your design eye gives you a massive advantage.` },
      { titleFn: () => "Brand Strategist", skills: ["Brand Strategy", "Visual Identity", "Market Research"], gapSkills: ["Market Analysis", "Competitive Positioning"], descFn: () => `Apply visual and strategic thinking to brand building. Designers make exceptional brand strategists.` },
    ],
    replacementTemplates: [
      { titleFn: () => "No-Code Product Builder", skills: ["Visual Design", "Prototyping", "User Flows"], gapSkills: ["Webflow", "Bubble", "No-Code Architecture"], descFn: () => `Build full products without code. Your design skills translate directly into shipping fast.` },
      { titleFn: () => "Design Educator & Mentor", skills: ["Design Process", "Figma", "Portfolio Review"], gapSkills: ["Teaching", "Curriculum Design", "Public Speaking"], descFn: (c) => `Share your ${c.topSkills} expertise with the next generation of designers.` },
      { titleFn: () => "AI-Assisted Design Specialist", skills: ["AI Tools", "Prompt Design", "Visual Design"], gapSkills: ["Midjourney/DALL-E", "AI Workflows", "Prompt Engineering"], descFn: () => `Combine traditional design skills with AI tools — an emerging, high-demand role.` },
    ],
  },
  engineering: {
    keywords: ["software", "developer", "engineer", "react", "javascript", "python",
      "node", "frontend", "backend", "full-stack", "fullstack", "devops", "cloud",
      "mobile", "ios", "android", "java", "typescript", "golang", "api", "docker",
      "kubernetes", "c++", "c#", ".net", "rust"],
    directTemplates: [
      { titleFn: (c) => `Senior ${c.primaryRole}`, descFn: (c) => `Your ${c.topSkills} skills are in high demand. This role matches your technical profile directly.` },
      { titleFn: (c) => `${c.primaryRole} (${c.workType})`, descFn: (c) => `A ${c.workType.toLowerCase()} engineering position. Your ${c.topSkills} expertise is the core requirement.` },
      { titleFn: (c) => `Staff ${c.primaryRole}`, descFn: (c) => `A senior IC track role where your ${c.yearsText} technical depth drives architecture and mentorship.` },
      { titleFn: (c) => `${c.primaryRole} — Contract`, descFn: (c) => `A contract opportunity to ease back in with high-impact ${c.topSkills} work and flexible terms.` },
    ],
    adjacentTemplates: [
      { titleFn: () => "Developer Advocate", skills: ["Technical Writing", "Public Speaking", "Coding"], gapSkills: ["Content Creation", "Community Building", "Demos"], descFn: (c) => `Your ${c.topSkills} background makes you ideal for bridging engineering and developer community.` },
      { titleFn: () => "Technical Project Manager", skills: ["Project Management", "Agile", "Technical Architecture"], gapSkills: ["Jira/Linear", "Stakeholder Management", "Roadmap Planning"], descFn: () => `Lead engineering teams with your technical depth — a rare advantage in PM.` },
      { titleFn: () => "Solutions Engineer", skills: ["API Design", "Client Communication", "Technical Demos"], gapSkills: ["Sales Engineering", "Consultative Selling"], descFn: (c) => `Use your ${c.topSkills} expertise to help customers integrate and succeed with products.` },
      { titleFn: () => "Engineering Manager", skills: ["Team Leadership", "Agile", "Technical Strategy"], gapSkills: ["People Management", "Performance Reviews", "Hiring"], descFn: () => `Transition from IC to leadership. Your technical credibility is the foundation.` },
    ],
    replacementTemplates: [
      { titleFn: () => "AI/ML Engineer", skills: ["Python", "Data Structures", "Mathematics"], gapSkills: ["Machine Learning", "PyTorch/TensorFlow", "LLM Fine-Tuning"], descFn: () => `Your engineering foundations transfer directly to the fastest-growing field in tech.` },
      { titleFn: () => "Cloud Solutions Architect", skills: ["Infrastructure", "Networking", "API Design"], gapSkills: ["AWS/GCP Certification", "Terraform", "Cloud Architecture"], descFn: () => `Help organizations design and build in the cloud. Your backend skills are the perfect base.` },
      { titleFn: () => "Freelance Technical Consultant", skills: ["Architecture", "Code Review", "Strategy"], gapSkills: ["Business Development", "Proposal Writing", "Client Management"], descFn: (c) => `Go independent with your ${c.topSkills} expertise. Flexible, high-value consulting.` },
    ],
  },
  data: {
    keywords: ["data", "analytics", "scientist", "machine learning", "ml", "ai",
      "statistics", "sql", "tableau", "power bi", "big data", "etl",
      "data warehouse", "business intelligence"],
    directTemplates: [
      { titleFn: (c) => `Senior ${c.primaryRole}`, descFn: (c) => `Your ${c.topSkills} skills make you a strong match for senior data roles.` },
      { titleFn: (c) => `${c.primaryRole} (${c.workType})`, descFn: (c) => `A ${c.workType.toLowerCase()} data role focused on ${c.topSkills}.` },
      { titleFn: (c) => `Lead ${c.primaryRole}`, descFn: (c) => `Drive data strategy with your ${c.yearsText} experience in ${c.topSkills}.` },
      { titleFn: () => "Business Intelligence Analyst", descFn: (c) => `Transform data into actionable insights. Your ${c.topSkills} expertise is directly applicable.` },
    ],
    adjacentTemplates: [
      { titleFn: () => "Product Analyst", skills: ["SQL", "Product Metrics", "A/B Testing"], gapSkills: ["Product Thinking", "Experimentation Frameworks"], descFn: (c) => `Bridge data and product. Your ${c.topSkills} skills are the foundation of great product analytics.` },
      { titleFn: () => "Data Engineer", skills: ["SQL", "Python", "ETL Pipelines"], gapSkills: ["Spark", "Airflow", "Data Modeling"], descFn: () => `Build the data infrastructure that powers analytics. Your query skills transfer directly.` },
      { titleFn: () => "Analytics Manager", skills: ["Team Leadership", "Analytics Strategy", "Stakeholder Communication"], gapSkills: ["People Management", "Executive Reporting"], descFn: (c) => `Lead an analytics team with your deep ${c.topSkills} expertise.` },
      { titleFn: () => "Quantitative Researcher", skills: ["Statistics", "Python", "Research Design"], gapSkills: ["Advanced Statistics", "Causal Inference"], descFn: () => `Apply rigorous analytical methods to complex problems.` },
    ],
    replacementTemplates: [
      { titleFn: () => "Machine Learning Engineer", skills: ["Python", "Statistics", "Linear Algebra"], gapSkills: ["PyTorch/TensorFlow", "Model Deployment", "MLOps"], descFn: () => `Your data foundations are the perfect springboard into ML engineering.` },
      { titleFn: () => "AI Product Manager", skills: ["Data Literacy", "Product Thinking", "Communication"], gapSkills: ["Product Management", "AI/ML Fundamentals", "Roadmapping"], descFn: () => `Combine data expertise with product leadership in the AI space.` },
      { titleFn: () => "Data Literacy Consultant", skills: ["Teaching", "Data Visualization", "Communication"], gapSkills: ["Consulting", "Workshop Facilitation", "Business Development"], descFn: (c) => `Help organizations become data-driven using your ${c.topSkills} expertise.` },
    ],
  },
  marketing: {
    keywords: ["marketing", "brand", "content", "seo", "social media", "copywriting",
      "campaign", "advertising", "communications", "pr", "public relations",
      "growth", "digital marketing", "email marketing"],
    directTemplates: [
      { titleFn: (c) => `Senior ${c.primaryRole}`, descFn: (c) => `Your ${c.topSkills} expertise makes this a direct match. Continue at the senior level.` },
      { titleFn: (c) => `${c.primaryRole} (${c.workType})`, descFn: (c) => `A ${c.workType.toLowerCase()} role leveraging your ${c.topSkills} skills.` },
      { titleFn: (c) => `Head of ${c.primaryRole.replace(/Manager|Lead|Specialist/i, "").trim()}`, descFn: (c) => `Lead the function with your ${c.yearsText} marketing experience.` },
      { titleFn: () => "Brand Strategist", descFn: (c) => `Shape brand narrative and positioning with your ${c.topSkills} background.` },
    ],
    adjacentTemplates: [
      { titleFn: () => "Product Marketing Manager", skills: ["Product Launches", "Market Research", "Positioning"], gapSkills: ["Competitive Intelligence", "Sales Enablement", "Product Launches"], descFn: (c) => `Bridge marketing and product. Your ${c.topSkills} skills are the foundation.` },
      { titleFn: () => "Community Manager", skills: ["Content Creation", "Engagement", "Brand Voice"], gapSkills: ["Community Platforms", "Event Management", "Metrics & Reporting"], descFn: () => `Build and nurture communities around brands. Your communication skills are the core.` },
      { titleFn: () => "Growth Marketing Analyst", skills: ["Analytics", "SEO", "Campaign Strategy"], gapSkills: ["Growth Frameworks", "Funnel Optimization", "Marketing Automation"], descFn: (c) => `Apply data-driven growth tactics. Your ${c.topSkills} experience provides strategic context.` },
      { titleFn: () => "Communications Director", skills: ["PR", "Stakeholder Relations", "Crisis Communication"], gapSkills: ["Media Relations", "Executive Communication"], descFn: () => `Lead organizational communication and public relations.` },
    ],
    replacementTemplates: [
      { titleFn: () => "AI Content Strategist", skills: ["Content Strategy", "AI Tools", "Editing"], gapSkills: ["AI Writing Tools", "Prompt Engineering", "AI Workflows"], descFn: () => `Combine content expertise with AI tools — an emerging, high-demand role.` },
      { titleFn: () => "Cohort Course Creator", skills: ["Teaching", "Content Creation", "Community"], gapSkills: ["Course Design", "Facilitation", "Platform Setup"], descFn: (c) => `Package your ${c.topSkills} expertise into online courses. Scalable income.` },
      { titleFn: () => "Freelance Marketing Consultant", skills: ["Strategy", "Client Relations", "Analytics"], gapSkills: ["Business Development", "Proposal Writing", "Personal Branding"], descFn: (c) => `Go independent with your ${c.topSkills} expertise. Flexible, high-value consulting.` },
    ],
  },
  healthcare: {
    keywords: ["healthcare", "medical", "nursing", "clinical", "hospital", "patient",
      "pharma", "health", "ehr", "telemedicine", "biotech"],
    directTemplates: [
      { titleFn: (c) => `Senior ${c.primaryRole}`, descFn: (c) => `Return to practice at the senior level. Your ${c.topSkills} background is directly applicable.` },
      { titleFn: (c) => `${c.primaryRole} (${c.workType})`, descFn: (c) => `A ${c.workType.toLowerCase()} healthcare position matching your ${c.topSkills} expertise.` },
      { titleFn: () => "Health Informatics Specialist", descFn: (c) => `Bridge clinical knowledge and technology. Your ${c.topSkills} experience is essential.` },
      { titleFn: () => "Clinical Research Coordinator", descFn: (c) => `Apply your ${c.topSkills} background to advancing medical research.` },
    ],
    adjacentTemplates: [
      { titleFn: () => "Health Tech Product Manager", skills: ["Product Thinking", "Healthcare Domain", "Stakeholder Communication"], gapSkills: ["Product Management", "Agile", "User Research"], descFn: () => `Shape telehealth products. Your clinical experience gives you unmatched user empathy.` },
      { titleFn: () => "Medical Science Liaison", skills: ["Clinical Knowledge", "Communication", "Research"], gapSkills: ["Pharma Industry", "KOL Management", "Regulatory Affairs"], descFn: () => `Bridge clinical practice and pharmaceutical science.` },
      { titleFn: () => "Patient Experience Manager", skills: ["Patient Care", "Process Improvement", "Team Leadership"], gapSkills: ["CX Frameworks", "Survey Design", "Data Analysis"], descFn: () => `Improve patient outcomes at an organizational level using your firsthand experience.` },
      { titleFn: () => "Healthcare Data Analyst", skills: ["Clinical Knowledge", "Data Analysis", "EHR Systems"], gapSkills: ["SQL", "Tableau", "Population Health Analytics"], descFn: () => `Combine clinical and analytical skills to drive data-informed decisions.` },
    ],
    replacementTemplates: [
      { titleFn: () => "Health & Wellness Coach", skills: ["Clinical Knowledge", "Communication", "Empathy"], gapSkills: ["Coaching Certification", "Business Development", "Digital Marketing"], descFn: () => `Use your clinical expertise to help individuals achieve their health goals.` },
      { titleFn: () => "Healthcare Consultant", skills: ["Domain Expertise", "Process Analysis", "Communication"], gapSkills: ["Consulting Frameworks", "Business Development"], descFn: (c) => `Advise healthcare organizations using your ${c.topSkills} expertise. High-value, flexible work.` },
      { titleFn: () => "Medical Writer", skills: ["Clinical Knowledge", "Writing", "Research"], gapSkills: ["Regulatory Writing", "Publication Standards", "Medical Editing"], descFn: () => `Translate complex medical information into clear content. Remote-friendly.` },
    ],
  },
  finance: {
    keywords: ["finance", "accounting", "financial", "investment", "banking", "audit",
      "tax", "cpa", "budgeting", "forecasting", "risk"],
    directTemplates: [
      { titleFn: (c) => `Senior ${c.primaryRole}`, descFn: (c) => `Continue your finance career at the senior level. Your ${c.topSkills} expertise is directly applicable.` },
      { titleFn: (c) => `${c.primaryRole} (${c.workType})`, descFn: (c) => `A ${c.workType.toLowerCase()} finance role matching your ${c.topSkills} background.` },
      { titleFn: () => "Financial Planning & Analysis Lead", descFn: (c) => `Drive strategic financial decisions. Your ${c.topSkills} experience is the core qualification.` },
      { titleFn: () => "Corporate Controller", descFn: (c) => `Oversee financial reporting and compliance with your ${c.yearsText} experience.` },
    ],
    adjacentTemplates: [
      { titleFn: () => "FinTech Product Analyst", skills: ["Financial Analysis", "Analytics", "Product Thinking"], gapSkills: ["Product Analytics", "SQL/Python", "A/B Testing"], descFn: (c) => `Apply your ${c.topSkills} expertise to shape financial technology products.` },
      { titleFn: () => "Risk & Compliance Manager", skills: ["Regulatory Knowledge", "Risk Assessment", "Audit"], gapSkills: ["Compliance Frameworks", "RegTech Tools"], descFn: () => `Your financial background is essential for navigating regulatory environments.` },
      { titleFn: () => "Business Operations Manager", skills: ["Financial Analysis", "Process Improvement", "Leadership"], gapSkills: ["Operations Management", "KPI Frameworks"], descFn: (c) => `Use your financial acumen to drive operational efficiency.` },
      { titleFn: () => "Treasury Analyst", skills: ["Cash Management", "Financial Modeling", "Risk Management"], gapSkills: ["Treasury Systems", "Liquidity Planning"], descFn: () => `Specialize in cash and liquidity management. Your foundations are directly applicable.` },
    ],
    replacementTemplates: [
      { titleFn: () => "Personal Finance Advisor", skills: ["Financial Planning", "Client Relations", "Communication"], gapSkills: ["CFP Certification", "Business Development", "Digital Marketing"], descFn: (c) => `Help individuals reach financial goals using your ${c.topSkills} expertise.` },
      { titleFn: () => "Finance Automation Consultant", skills: ["Excel", "Financial Processes", "Analysis"], gapSkills: ["RPA Tools", "Python", "Process Automation"], descFn: () => `Automate financial workflows. Combines domain expertise with technology.` },
      { titleFn: () => "Financial Literacy Educator", skills: ["Financial Knowledge", "Communication", "Teaching"], gapSkills: ["Curriculum Design", "Content Creation", "Public Speaking"], descFn: (c) => `Share your ${c.topSkills} knowledge through courses, workshops, and content.` },
    ],
  },
  education: {
    keywords: ["education", "teaching", "teacher", "professor", "curriculum",
      "instructional", "learning", "training", "academic", "school"],
    directTemplates: [
      { titleFn: (c) => `Senior ${c.primaryRole}`, descFn: (c) => `Return to education at the senior level. Your ${c.topSkills} experience is a direct match.` },
      { titleFn: (c) => `${c.primaryRole} (${c.workType})`, descFn: (c) => `A ${c.workType.toLowerCase()} education position leveraging your ${c.topSkills} background.` },
      { titleFn: () => "Instructional Designer", descFn: (c) => `Design learning experiences that scale. Your ${c.topSkills} background powers effective curriculum creation.` },
      { titleFn: () => "Curriculum Development Lead", descFn: (c) => `Lead curriculum strategy with your deep ${c.topSkills} expertise.` },
    ],
    adjacentTemplates: [
      { titleFn: () => "Learning & Development Manager", skills: ["Training", "Curriculum Design", "Program Management"], gapSkills: ["Corporate L&D", "LMS Administration", "Performance Metrics"], descFn: () => `Your teaching expertise is in high demand in corporate training.` },
      { titleFn: () => "EdTech Product Manager", skills: ["Education Domain", "User Empathy", "Product Thinking"], gapSkills: ["Product Management", "Agile", "Data Analytics"], descFn: (c) => `Shape education technology products with your ${c.topSkills} domain insight.` },
      { titleFn: () => "Academic Program Manager", skills: ["Program Management", "Stakeholder Relations", "Curriculum"], gapSkills: ["Accreditation", "Budget Management", "Enrollment Strategy"], descFn: () => `Manage educational programs with your deep pedagogical understanding.` },
      { titleFn: () => "Student Success Coordinator", skills: ["Mentoring", "Communication", "Student Support"], gapSkills: ["CRM Systems", "Retention Analytics", "Case Management"], descFn: () => `Support student outcomes using your teaching experience. High-impact role.` },
    ],
    replacementTemplates: [
      { titleFn: () => "Online Course Creator", skills: ["Teaching", "Content Creation", "Subject Expertise"], gapSkills: ["Video Production", "Platform Setup", "Marketing"], descFn: (c) => `Package your ${c.topSkills} knowledge into online courses. Scalable income.` },
      { titleFn: () => "Corporate Trainer / Facilitator", skills: ["Facilitation", "Training Design", "Public Speaking"], gapSkills: ["Corporate Culture", "Assessment Design", "Virtual Facilitation"], descFn: () => `Bring teaching expertise into the corporate world. Remote-friendly.` },
      { titleFn: () => "Educational Content Writer", skills: ["Writing", "Subject Expertise", "Research"], gapSkills: ["SEO", "Content Strategy", "EdTech Platforms"], descFn: (c) => `Create educational content that reaches millions. Your ${c.topSkills} ensures depth.` },
    ],
  },
  general: {
    keywords: [],
    directTemplates: [
      { titleFn: (c) => `Senior ${c.primaryRole}`, descFn: (c) => `Continue your career at the experienced level. Your ${c.topSkills} skills map directly.` },
      { titleFn: (c) => `${c.primaryRole} (${c.workType})`, descFn: (c) => `A ${c.workType.toLowerCase()} position matching your profile and ${c.topSkills} expertise.` },
      { titleFn: (c) => `Lead ${c.primaryRole}`, descFn: (c) => `Step into leadership with your ${c.yearsText} experience and strategic skills.` },
    ],
    adjacentTemplates: [
      { titleFn: () => "Project Manager", skills: ["Organization", "Communication", "Planning"], gapSkills: ["PMP/Agile Certification", "Jira/Asana", "Stakeholder Management"], descFn: (c) => `Your ${c.topSkills} background gives strong domain knowledge for project leadership.` },
      { titleFn: () => "Operations Manager", skills: ["Process Improvement", "Team Leadership", "Analytics"], gapSkills: ["Operations Strategy", "KPI Frameworks", "Change Management"], descFn: (c) => `Apply your experience to streamlining operations.` },
      { titleFn: () => "Customer Success Manager", skills: ["Client Relations", "Communication", "Problem-Solving"], gapSkills: ["CRM Tools", "Health Scoring", "Renewal Strategy"], descFn: () => `Drive customer outcomes with domain expertise and relationship skills.` },
    ],
    replacementTemplates: [
      { titleFn: () => "Freelance Consultant", skills: ["Strategy", "Communication", "Domain Expertise"], gapSkills: ["Business Development", "Personal Branding", "Proposal Writing"], descFn: (c) => `Go independent with your ${c.topSkills} expertise. Flexible hours and premium clients.` },
      { titleFn: () => "Career Coach / Mentor", skills: ["Communication", "Empathy", "Domain Knowledge"], gapSkills: ["Coaching Certification", "Business Development", "Digital Presence"], descFn: (c) => `Help others navigate careers using your ${c.topSkills} experience.` },
      { titleFn: () => "AI-Assisted Specialist", skills: ["Domain Knowledge", "Problem-Solving", "Communication"], gapSkills: ["AI Tools", "Prompt Engineering", "Automation"], descFn: () => `Combine domain expertise with AI tools — experienced professionals excel here.` },
    ],
  },
};

// ─── Salary Ranges by domain & category ─────────────────────────────────────
const SALARY_RANGES = {
  design:      { direct: ["$90k–$120k","$100k–$135k","$110k–$145k","$95k–$125k"], adjacent: ["$80k–$110k","$85k–$115k","$90k–$120k","$85k–$110k"], replacement: ["$65k–$95k","$60k–$90k","$75k–$105k"] },
  engineering: { direct: ["$120k–$160k","$110k–$145k","$130k–$175k","$100k–$140k"], adjacent: ["$95k–$130k","$100k–$135k","$110k–$140k","$105k–$140k"], replacement: ["$130k–$180k","$120k–$160k","$90k–$140k"] },
  data:        { direct: ["$95k–$130k","$85k–$115k","$105k–$140k","$80k–$110k"], adjacent: ["$90k–$120k","$95k–$135k","$100k–$130k","$85k–$115k"], replacement: ["$120k–$170k","$100k–$140k","$80k–$110k"] },
  marketing:   { direct: ["$85k–$115k","$80k–$105k","$95k–$125k","$75k–$100k"], adjacent: ["$75k–$105k","$70k–$90k","$80k–$110k","$85k–$115k"], replacement: ["$70k–$100k","$55k–$85k","$65k–$110k"] },
  healthcare:  { direct: ["$75k–$110k","$80k–$115k","$85k–$120k","$70k–$100k"], adjacent: ["$90k–$125k","$80k–$110k","$75k–$105k","$70k–$100k"], replacement: ["$60k–$90k","$75k–$110k","$65k–$95k"] },
  finance:     { direct: ["$90k–$130k","$85k–$120k","$100k–$140k","$95k–$135k"], adjacent: ["$80k–$115k","$85k–$120k","$90k–$125k","$80k–$110k"], replacement: ["$70k–$100k","$80k–$115k","$65k–$95k"] },
  education:   { direct: ["$60k–$90k","$55k–$85k","$65k–$95k","$70k–$100k"], adjacent: ["$80k–$115k","$75k–$105k","$70k–$95k","$65k–$90k"], replacement: ["$50k–$85k","$60k–$95k","$55k–$80k"] },
  general:     { direct: ["$75k–$110k","$80k–$115k","$90k–$125k"], adjacent: ["$70k–$100k","$75k–$105k","$80k–$110k"], replacement: ["$60k–$95k","$65k–$100k","$70k–$105k"] },
};

const WORK_TYPES = ["Remote", "Hybrid", "Onsite", "Remote"];

// ─── Goal Weights ───────────────────────────────────────────────────────────
const GOAL_WEIGHTS = {
  "same-role":   { direct: 1.15, adjacent: 0.85, replacement: 0.70 },
  "pivot":       { direct: 0.75, adjacent: 1.15, replacement: 1.10 },
  "flexible":    { direct: 1.00, adjacent: 1.00, replacement: 1.00 },
  "leadership":  { direct: 1.10, adjacent: 1.00, replacement: 0.80 },
  "freelance":   { direct: 0.80, adjacent: 0.95, replacement: 1.20 },
};

// ─── Skill Aliases ──────────────────────────────────────────────────────────
const ALIASES = {
  "ui design": ["ui", "interface design", "visual design", "ui/ux", "figma"],
  "ux design": ["ux", "user experience", "ui/ux", "interaction design"],
  "figma": ["ui design", "sketch", "design tools", "prototyping"],
  "react": ["reactjs", "react.js", "frontend", "front-end"],
  "javascript": ["js", "typescript", "ts", "node", "frontend"],
  "node.js": ["node", "nodejs", "backend", "express", "server-side"],
  "python": ["py", "django", "flask", "data science", "machine learning"],
  "sql": ["database", "postgresql", "mysql", "data analysis", "queries"],
  "css": ["styling", "tailwind", "sass", "scss", "design systems"],
  "html": ["web development", "frontend", "markup"],
  "design systems": ["component library", "ui kit", "design tokens"],
  "prototyping": ["wireframing", "mockups", "figma", "sketch"],
  "user research": ["usability testing", "ux research", "interviews"],
  "analytics": ["data analysis", "google analytics", "metrics"],
  "project management": ["agile", "scrum", "jira", "planning"],
  "copywriting": ["writing", "content writing", "copywriting & editing"],
  "content marketing": ["content strategy", "blogging", "seo"],
  "team leadership": ["management", "leadership", "people management"],
  "visual design": ["graphic design", "illustration", "ui design"],
  "typography": ["fonts", "type design", "visual design"],
  "color theory": ["visual design", "branding", "ui design"],
  "responsive design": ["mobile design", "css", "web design"],
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function detectDomain(signals) {
  const text = signals.join(" ").toLowerCase();
  const scores = {};
  Object.entries(DOMAIN_MAP).forEach(([domain, cfg]) => {
    if (domain === "general") return;
    scores[domain] = cfg.keywords.reduce((n, kw) => n + (text.includes(kw) ? 1 : 0), 0);
  });
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0][1] >= 2 ? sorted[0][0] : "general";
}

function extractPrimaryRole(headline, targetRoles, experienceTitles, lastRole) {
  if (targetRoles.length > 0) return targetRoles[0];
  if (headline) return headline.split(/\s+at\s+/i)[0].trim();
  if (lastRole) return lastRole.split(/\s+at\s+/i)[0].trim();
  if (experienceTitles.length > 0) return experienceTitles[0];
  return "Professional";
}

function inferYearsText(experience) {
  if (experience.length >= 4) return "extensive";
  if (experience.length >= 2) return "solid";
  if (experience.length >= 1) return "valuable";
  return "your";
}

function computeSkillMatch(userSkills, templateSkills) {
  if (!templateSkills || templateSkills.length === 0) return 100;
  const norm = userSkills.map(s => s.toLowerCase());
  let matched = 0;
  templateSkills.forEach(ts => {
    const low = ts.toLowerCase();
    if (norm.some(us => us === low || us.includes(low) || low.includes(us))) matched++;
  });
  return Math.round((matched / templateSkills.length) * 100);
}

// ─── calculateMatch (exported for roadmapEngine) ───────────────────────────
function calculateMatch(userSkills, role, goal = "flexible") {
  const normalizedUser = (userSkills || []).map(s => s.toLowerCase().trim());
  const required = (role.requiredSkills || []).map(s => s.toLowerCase().trim());
  let matched = 0;
  const gaps = [];

  required.forEach(req => {
    const found = normalizedUser.some(us => {
      if (us === req) return true;
      if (us.includes(req) || req.includes(us)) return true;
      const uWords = us.split(/\s+/), rWords = req.split(/\s+/);
      if (rWords.some(rw => uWords.includes(rw) && rw.length > 2)) return true;
      const rAliases = ALIASES[req] || [];
      if (rAliases.some(a => us.includes(a) || a.includes(us))) return true;
      const uAliases = ALIASES[us] || [];
      if (uAliases.some(a => req.includes(a) || a.includes(req))) return true;
      return false;
    });
    if (found) matched++; else gaps.push(req.replace(/\b\w/g, c => c.toUpperCase()));
  });

  if (role.gapSkills) role.gapSkills.forEach(g => { if (!gaps.includes(g)) gaps.push(g); });

  let base = required.length > 0 ? Math.round((matched / required.length) * 100) : 50;
  const w = (GOAL_WEIGHTS[goal] || GOAL_WEIGHTS.flexible)[role.category] || 1;
  let final = Math.max(30, Math.min(99, Math.round(base * w)));
  return { matchScore: final, skillGaps: gaps.slice(0, 4) };
}

// Kept for backward compat with roadmapEngine (empty — all generation is dynamic now)
const ROLE_DATABASE = [];

// ─── Main Generator ─────────────────────────────────────────────────────────
function generateRecommendations({
  skills = [], goal = "flexible", category = null,
  headline = "", targetRoles = [], experience = [],
  education = [], certifications = [], industry = "", lastRole = "",
}) {
  // Gather signals
  const experienceTitles = experience.map(e => e.title || "").filter(Boolean);
  const signals = [
    headline, ...skills, ...targetRoles, ...experienceTitles,
    ...(education.map(e => e.degree || "")),
    ...(certifications.map(c => c.name || "")),
    industry, lastRole,
  ].filter(Boolean);

  const domain = detectDomain(signals);
  const domainCfg = DOMAIN_MAP[domain];

  const primaryRole = extractPrimaryRole(headline, targetRoles, experienceTitles, lastRole);
  const topSkills = skills.slice(0, 3).join(", ") || "your core";
  const yearsText = inferYearsText(experience);
  const ctx = { primaryRole, topSkills, yearsText, workType: "Remote", domain };

  const results = { direct: [], adjacent: [], replacement: [] };

  // ── DIRECT ────────────────────────────────────────────────────────────
  if (!category || category === "direct") {
    const salaries = SALARY_RANGES[domain]?.direct || SALARY_RANGES.general.direct;
    domainCfg.directTemplates.forEach((tpl, i) => {
      const wt = WORK_TYPES[i % WORK_TYPES.length];
      const lc = { ...ctx, workType: wt };
      const title = tpl.titleFn(lc);

      // Match: start high because direct roles are built from user's profile
      const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      const skillText = skills.map(s => s.toLowerCase()).join(" ");
      const titleHits = titleWords.filter(w => skillText.includes(w) || headline.toLowerCase().includes(w)).length;
      let match = Math.min(99, 70 + titleHits * 8);
      const weights = GOAL_WEIGHTS[goal] || GOAL_WEIGHTS.flexible;
      match = Math.min(99, Math.round(match * weights.direct));

      results.direct.push({
        id: `direct-${domain}-${i}`,
        title,
        company: wt,
        match,
        gap: [],
        salary: salaries[i % salaries.length],
        type: wt,
        desc: tpl.descFn(lc),
      });
    });
  }

  // ── ADJACENT ──────────────────────────────────────────────────────────
  if (!category || category === "adjacent") {
    const salaries = SALARY_RANGES[domain]?.adjacent || SALARY_RANGES.general.adjacent;
    domainCfg.adjacentTemplates.forEach((tpl, i) => {
      const wt = WORK_TYPES[(i + 1) % WORK_TYPES.length];
      const lc = { ...ctx, workType: wt };
      const title = tpl.titleFn(lc);

      const skillMatch = computeSkillMatch(skills, tpl.skills);
      const weights = GOAL_WEIGHTS[goal] || GOAL_WEIGHTS.flexible;
      let match = Math.min(99, Math.round(Math.max(40, skillMatch * 0.7 + 30) * weights.adjacent));

      results.adjacent.push({
        id: `adjacent-${domain}-${i}`,
        title,
        company: wt,
        match,
        gap: tpl.gapSkills || [],
        salary: salaries[i % salaries.length],
        type: wt,
        desc: tpl.descFn(lc),
      });
    });
  }

  // ── REPLACEMENT (New Horizons) ────────────────────────────────────────
  if (!category || category === "replacement") {
    const salaries = SALARY_RANGES[domain]?.replacement || SALARY_RANGES.general.replacement;
    domainCfg.replacementTemplates.forEach((tpl, i) => {
      const wt = WORK_TYPES[(i + 2) % WORK_TYPES.length];
      const lc = { ...ctx, workType: wt };
      const title = tpl.titleFn(lc);

      const skillMatch = computeSkillMatch(skills, tpl.skills);
      const weights = GOAL_WEIGHTS[goal] || GOAL_WEIGHTS.flexible;
      let match = Math.min(99, Math.round(Math.max(35, skillMatch * 0.6 + 25) * weights.replacement));

      results.replacement.push({
        id: `replacement-${domain}-${i}`,
        title,
        company: wt,
        match,
        gap: tpl.gapSkills || [],
        salary: salaries[i % salaries.length],
        type: wt,
        desc: tpl.descFn(lc),
      });
    });
  }

  // Sort by match descending
  Object.keys(results).forEach(cat => {
    results[cat].sort((a, b) => b.match - a.match);
  });

  return results;
}

module.exports = { generateRecommendations, calculateMatch, ROLE_DATABASE };
