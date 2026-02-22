export const mockRecommendations = {
  direct: [
    { id: 1, title: "Senior Marketing Manager", company: "Glossier", match: 94, gap: ["Advanced Analytics", "SEO Strategy"], salary: "$95k – $115k", type: "Remote", desc: "Lead brand strategy for a fast-growing beauty startup. Your pre-break experience maps closely to this role's core requirements." },
    { id: 2, title: "Content Strategy Lead", company: "Notion", match: 88, gap: ["Notion AI", "B2B SaaS Fundamentals"], salary: "$85k – $105k", type: "Hybrid", desc: "Own the editorial roadmap and content architecture across multiple product lines. Strong writing background essential." },
    { id: 3, title: "Brand Director", company: "Patagonia", match: 82, gap: ["Sustainability Communications", "Impact Reporting"], salary: "$105k – $130k", type: "Onsite", desc: "Champion brand identity and storytelling for a mission-driven, iconic company." },
  ],
  adjacent: [
    { id: 4, title: "UX Researcher", company: "Figma", match: 73, gap: ["Quantitative Research", "Usability Testing", "Figma Prototyping"], salary: "$90k – $110k", type: "Hybrid", desc: "Bridge user needs and product decisions. Your marketing empathy is a genuine advantage in this field." },
    { id: 5, title: "Community Manager", company: "Linear", match: 70, gap: ["Developer Community", "Discord Moderation"], salary: "$70k – $85k", type: "Remote", desc: "Build and nurture a passionate engineering community for one of the fastest-growing dev tools." },
  ],
  replacement: [
    { id: 6, title: "AI Prompt Engineer", company: "Jasper AI", match: 65, gap: ["Prompt Engineering", "LLM Fundamentals"], salary: "$80k – $100k", type: "Remote", desc: "An emerging role where career changers consistently excel. Your writing and strategic thinking transfer directly." },
    { id: 7, title: "Cohort Course Creator", company: "Maven", match: 68, gap: ["Course Design", "Facilitation"], salary: "$60k – $90k", type: "Remote", desc: "Turn professional expertise into scalable income through cohort-based learning." },
  ],
};

export const mockRoadmap = [
  { id: 1, title: "Update LinkedIn Profile", desc: "Reframe your headline and add career break context with authenticity and confidence", done: true, week: "Week 1" },
  { id: 2, title: "Complete Skills Audit", desc: "Identify your top five transferable skills and three gaps to address intentionally", done: true, week: "Week 1" },
  { id: 3, title: "Complete AI Tools Course", desc: "LinkedIn Learning: AI for Marketing Professionals — approximately four hours", done: false, week: "Week 2" },
  { id: 4, title: "Reconnect with Five Contacts", desc: "Reach out to former colleagues with a warm, genuine re-introduction message", done: false, week: "Week 2–3" },
  { id: 5, title: "Apply to Three Target Roles", desc: "Use your tailored resume for each application — quality over volume", done: false, week: "Week 3–4" },
  { id: 6, title: "Schedule a Mock Interview", desc: "Practice with Renova's AI interview coach and refine your career break narrative", done: false, week: "Week 4" },
  { id: 7, title: "Celebrate Your First Interview", desc: "A significant milestone that deserves recognition — you have earned it", done: false, week: "Week 5+" },
];

export const mockPosts = [
  { id: 1, author: "Sarah M.", initials: "SM", anon: false, time: "2 hours ago", text: "Just received my first callback after four years out. The LinkedIn refresh made all the difference — do not underestimate your profile headline. If I can do it, so can you.", likes: 47, comments: 12, tags: ["LinkedIn", "Win"] },
  { id: 2, author: "Anonymous", initials: "AN", anon: true, time: "5 hours ago", text: "Feeling the imposter syndrome quite hard today. Started a new role this week and keep waiting for someone to realise their mistake. Is this experience common here?", likes: 89, comments: 31, tags: ["Imposter Syndrome", "Support"] },
  { id: 3, author: "Priya K.", initials: "PK", anon: false, time: "1 day ago", text: "Sharing my career break explanation that worked in three interviews: 'I took this time intentionally, and I'm returning with far more clarity about what I want to contribute.' Be specific, be honest. It works.", likes: 134, comments: 28, tags: ["Interview Tips"] },
  { id: 4, author: "Maya R.", initials: "MR", anon: false, time: "2 days ago", text: "Pivoted from traditional marketing into AI prompt engineering — fully remote, pays significantly more, and honestly feels like the right direction. The Replacement Roles section on Renova prompted the idea.", likes: 201, comments: 55, tags: ["Career Pivot", "Win"] },
];

export const dashboardMetrics = {
  comebackScore: 78,
  confidenceHistory: [20, 28, 35, 42, 50, 58, 65],
  skillsData: [
    { skill: "Marketing", val: 88 },
    { skill: "Writing", val: 92 },
    { skill: "Strategy", val: 75 },
    { skill: "Analytics", val: 58 },
    { skill: "AI Tools", val: 42 },
    { skill: "Leadership", val: 80 },
  ],
};

export const mockProfileData = (userName) => ({
  name: userName || "Alexandra Chen",
  headline: "Senior Marketing Manager · Brand Strategy · Content Leadership · Career Returner",
  location: "London, United Kingdom",
  website: "linkedin.com/in/alexandra-chen",
  about: "Senior marketing leader with 12 years of experience across FMCG, technology, and consumer brands. Intentional career break from 2021–2024 for primary caregiving. Returning with renewed energy, updated skills in AI marketing tools, and an even sharper strategic perspective.\n\nSpecialisms: brand positioning, integrated campaigns, team leadership, and data-informed content strategy.",
  careerBreak: "From 2021 to 2024, I took a deliberate career pause to care for my two children and a family member experiencing a health challenge. During this time, I completed the Google Analytics 4 certification, the MIT Digital Marketing Analytics programme, and an AI Tools for Marketing course. I also served as Communications Lead for a women's charity, growing their subscriber base from 800 to 4,200.",
  experience: [
    { id: 1, title: "Senior Marketing Manager", company: "Unilever", location: "London", start: "2018", end: "2021", current: false, desc: "Led integrated marketing strategy for the Dove brand across EMEA. Managed a team of eight and a £4.2M annual budget. Delivered the 'Real Conversations' campaign, winner of a Silver Cannes Lion." },
    { id: 2, title: "Brand Manager", company: "Diageo", location: "London", start: "2014", end: "2018", current: false, desc: "Managed brand positioning and campaign execution for Baileys and Tanqueray across digital and traditional channels. Drove 23% uplift in digital share of voice within 18 months." },
    { id: 3, title: "Marketing Executive", company: "Ogilvy", location: "London", start: "2011", end: "2014", current: false, desc: "Client-facing marketing support for multinational accounts. Coordinated campaigns across TV, OOH, and digital." },
  ],
  education: [
    { id: 1, institution: "London Business School", degree: "Executive Education — Strategic Marketing Leadership", years: "2020", grade: "Distinction" },
    { id: 2, institution: "University of Edinburgh", degree: "MA Marketing and Business", years: "2008 – 2011", grade: "First Class Honours" },
  ],
  certifications: [
    { id: 1, name: "Google Analytics 4 Certification", issuer: "Google", year: "2024" },
    { id: 2, name: "Digital Marketing Analytics", issuer: "MIT xPRO Online", year: "2023" },
    { id: 3, name: "AI Tools for Marketing Professionals", issuer: "LinkedIn Learning", year: "2024" },
    { id: 4, name: "Project Management Foundations", issuer: "PMI", year: "2019" },
  ],
  skills: ["Brand Strategy", "Content Marketing", "Team Leadership", "Campaign Management", "Google Analytics 4", "Copywriting & Editing", "Budget Management", "Stakeholder Relations", "SEO Fundamentals", "Market Research"],
  achievements: [
    { id: 1, title: "Marketing Week Rising Star", org: "Marketing Week", year: "2019", desc: "Selected as one of 30 rising stars in UK marketing under the age of 35, recognised for innovation in consumer-led brand storytelling." },
    { id: 2, title: "Silver Cannes Lion — FMCG Category", org: "Cannes Lions International", year: "2020", desc: "Co-led the Dove 'Real Conversations' pan-European campaign that earned a Silver Lion for brand authenticity and social impact." },
    { id: 3, title: "Campaign of the Year", org: "The Drum Awards", year: "2019", desc: "Shortlisted for Campaign of the Year for an integrated Christmas campaign delivering 220% of projected digital engagement." },
  ],
  volunteering: [
    { id: 1, org: "Step Forward Women's Charity", role: "Communications Lead", years: "2021 – 2024", desc: "Managed all external communications for a charity supporting low-income women returning to employment — including social media, donor newsletter, annual report, and press relations. Grew the newsletter audience from 800 to 4,200 subscribers." },
  ],
  languages: [
    { id: 1, name: "English", level: "Native" },
    { id: 2, name: "French", level: "Professional Working Proficiency" },
    { id: 3, name: "Mandarin", level: "Elementary" },
  ],
  openTo: ["Full-time", "Hybrid Working", "Senior Individual Contributor", "People Management"],
  targetRoles: ["Marketing Director", "Brand Strategy Lead", "Head of Content", "Senior Marketing Manager"],
});
