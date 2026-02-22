// ─── Seed Data Utility ──────────────────────────────────────────────────────
// Run with: npm run seed
// Seeds the database with sample data for development/testing
// ────────────────────────────────────────────────────────────────────────────

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const bcrypt = require("bcryptjs");
const supabase = require("../config/supabase");

const SEED_POSTS = [
  {
    text: "Just received my first callback after four years out. The LinkedIn refresh made all the difference — do not underestimate your profile headline. If I can do it, so can you.",
    is_anonymous: false,
    tags: ["LinkedIn", "Win"],
    likes_count: 47,
  },
  {
    text: "Feeling the imposter syndrome quite hard today. Started a new role this week and keep waiting for someone to realise their mistake. Is this experience common here?",
    is_anonymous: true,
    tags: ["Imposter Syndrome", "Support"],
    likes_count: 89,
  },
  {
    text: "Sharing my career break explanation that worked in three interviews: 'I took this time intentionally, and I'm returning with far more clarity about what I want to contribute.' Be specific, be honest. It works.",
    is_anonymous: false,
    tags: ["Interview Tips"],
    likes_count: 134,
  },
  {
    text: "Pivoted from traditional marketing into AI prompt engineering — fully remote, pays significantly more, and honestly feels like the right direction. The Replacement Roles section on Renova prompted the idea.",
    is_anonymous: false,
    tags: ["Career Pivot", "Win"],
    likes_count: 201,
  },
];

async function seed() {
  console.log("🌱 Seeding database...\n");

  try {
    // 1. Create demo user
    console.log("  Creating demo user...");
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash("password123", salt);

    const { data: user, error: userError } = await supabase
      .from("users")
      .upsert(
        { name: "Alexandra Chen", email: "alex@demo.com", password_hash: passwordHash },
        { onConflict: "email" }
      )
      .select()
      .single();

    if (userError) throw userError;
    console.log(`  ✓ Demo user: ${user.email} (password: password123)\n`);

    // 2. Create onboarding
    console.log("  Creating onboarding data...");
    await supabase
      .from("onboarding")
      .upsert({
        user_id: user.id,
        career_break_years: "3 years",
        last_role: "Senior Marketing Manager at Unilever",
        industry: "Marketing",
        skills: ["Brand Strategy", "Content Marketing", "Team Leadership", "Campaign Management", "Google Analytics", "Copywriting"],
        confidence: 65,
        goal: "same-role",
        completed: true,
      }, { onConflict: "user_id" });
    console.log("  ✓ Onboarding data\n");

    // 3. Create profile
    console.log("  Creating profile...");
    const { data: profile } = await supabase
      .from("profiles")
      .upsert({
        user_id: user.id,
        headline: "Senior Marketing Manager · Brand Strategy · Content Leadership · Career Returner",
        location: "London, United Kingdom",
        website: "linkedin.com/in/alexandra-chen",
        about: "Senior marketing leader with 12 years of experience across FMCG, technology, and consumer brands. Intentional career break from 2021–2024 for primary caregiving. Returning with renewed energy, updated skills in AI marketing tools, and an even sharper strategic perspective.\n\nSpecialisms: brand positioning, integrated campaigns, team leadership, and data-informed content strategy.",
        career_break: "From 2021 to 2024, I took a deliberate career pause to care for my two children and a family member experiencing a health challenge. During this time, I completed the Google Analytics 4 certification, the MIT Digital Marketing Analytics programme, and an AI Tools for Marketing course. I also served as Communications Lead for a women's charity, growing their subscriber base from 800 to 4,200.",
        skills: ["Brand Strategy", "Content Marketing", "Team Leadership", "Campaign Management", "Google Analytics 4", "Copywriting & Editing", "Budget Management", "Stakeholder Relations", "SEO Fundamentals", "Market Research"],
        open_to: ["Full-time", "Hybrid Working", "Contract / Interim", "Advisory / Board Roles"],
        target_roles: ["Marketing Director", "Head of Brand", "Content Strategy Lead", "VP of Marketing"],
        banner_index: 0,
      }, { onConflict: "user_id" })
      .select()
      .single();
    console.log("  ✓ Profile\n");

    // 4. Add experience
    console.log("  Adding experience entries...");
    await supabase.from("experience").delete().eq("profile_id", profile.id);
    await supabase.from("experience").insert([
      { profile_id: profile.id, title: "Senior Marketing Manager", company: "Unilever", location: "London", start_date: "2018", end_date: "2021", is_current: false, description: "Led integrated marketing strategy for the Dove brand across EMEA. Managed a team of eight and a £4.2M annual budget. Delivered the 'Real Conversations' campaign, winner of a Silver Cannes Lion.", sort_order: 1 },
      { profile_id: profile.id, title: "Brand Manager", company: "Diageo", location: "London", start_date: "2014", end_date: "2018", is_current: false, description: "Managed brand positioning and campaign execution for Baileys and Tanqueray across digital and traditional channels. Drove 23% uplift in digital share of voice within 18 months.", sort_order: 2 },
      { profile_id: profile.id, title: "Marketing Executive", company: "Ogilvy", location: "London", start_date: "2011", end_date: "2014", is_current: false, description: "Client-facing marketing support for multinational accounts. Coordinated campaigns across TV, OOH, and digital.", sort_order: 3 },
    ]);
    console.log("  ✓ Experience (3 entries)\n");

    // 5. Add education
    console.log("  Adding education entries...");
    await supabase.from("education").delete().eq("profile_id", profile.id);
    await supabase.from("education").insert([
      { profile_id: profile.id, institution: "London Business School", degree: "Executive Education — Strategic Marketing Leadership", years: "2020", grade: "Distinction", sort_order: 1 },
      { profile_id: profile.id, institution: "University of Edinburgh", degree: "MA Marketing and Business", years: "2008 – 2011", grade: "First Class Honours", sort_order: 2 },
    ]);
    console.log("  ✓ Education (2 entries)\n");

    // 6. Add certifications
    console.log("  Adding certifications...");
    await supabase.from("certifications").delete().eq("profile_id", profile.id);
    await supabase.from("certifications").insert([
      { profile_id: profile.id, name: "Google Analytics 4 Certification", issuer: "Google", year: "2024", sort_order: 1 },
      { profile_id: profile.id, name: "Digital Marketing Analytics", issuer: "MIT xPRO Online", year: "2023", sort_order: 2 },
      { profile_id: profile.id, name: "AI Tools for Marketing Professionals", issuer: "LinkedIn Learning", year: "2024", sort_order: 3 },
      { profile_id: profile.id, name: "Project Management Foundations", issuer: "PMI", year: "2019", sort_order: 4 },
    ]);
    console.log("  ✓ Certifications (4 entries)\n");

    // 7. Add achievements
    console.log("  Adding achievements...");
    await supabase.from("achievements").delete().eq("profile_id", profile.id);
    await supabase.from("achievements").insert([
      { profile_id: profile.id, title: "Marketing Week Rising Star", org: "Marketing Week", year: "2019", description: "Selected as one of 30 rising stars in UK marketing under 35, recognised for innovation in consumer-led brand storytelling.", sort_order: 1 },
      { profile_id: profile.id, title: "Silver Cannes Lion — FMCG Category", org: "Cannes Lions International", year: "2020", description: "Co-led the Dove 'Real Conversations' pan-European campaign that earned a Silver Lion for brand authenticity.", sort_order: 2 },
      { profile_id: profile.id, title: "Campaign of the Year", org: "The Drum Awards", year: "2019", description: "Shortlisted for Campaign of the Year for integrated Christmas campaign delivering 220% of projected digital engagement.", sort_order: 3 },
    ]);
    console.log("  ✓ Achievements (3 entries)\n");

    // 8. Add volunteering
    console.log("  Adding volunteering...");
    await supabase.from("volunteering").delete().eq("profile_id", profile.id);
    await supabase.from("volunteering").insert([
      { profile_id: profile.id, org: "Women Returners Network", role: "Communications Lead (Volunteer)", years: "2022 – 2024", description: "Managed newsletter and social media strategy. Grew subscriber base from 800 to 4,200.", sort_order: 1 },
    ]);
    console.log("  ✓ Volunteering (1 entry)\n");

    // 9. Add languages
    console.log("  Adding languages...");
    await supabase.from("languages").delete().eq("profile_id", profile.id);
    await supabase.from("languages").insert([
      { profile_id: profile.id, name: "English", level: "Native", sort_order: 1 },
      { profile_id: profile.id, name: "Mandarin", level: "Conversational", sort_order: 2 },
      { profile_id: profile.id, name: "French", level: "Basic", sort_order: 3 },
    ]);
    console.log("  ✓ Languages (3 entries)\n");

    // 10. Create roadmap
    console.log("  Creating roadmap milestones...");
    await supabase.from("roadmap").delete().eq("user_id", user.id);
    await supabase.from("roadmap").insert([
      { user_id: user.id, title: "Update LinkedIn Profile", description: "Reframe your headline and add career break context with authenticity and confidence", done: true, week: "Week 1", sort_order: 1 },
      { user_id: user.id, title: "Complete Skills Audit", description: "Identify your top five transferable skills and three gaps to address intentionally", done: true, week: "Week 1", sort_order: 2 },
      { user_id: user.id, title: "Complete AI Tools Course", description: "LinkedIn Learning: AI for Marketing Professionals — approximately four hours", done: false, week: "Week 2", sort_order: 3 },
      { user_id: user.id, title: "Reconnect with Five Contacts", description: "Reach out to former colleagues with a warm, genuine re-introduction message", done: false, week: "Week 2–3", sort_order: 4 },
      { user_id: user.id, title: "Apply to Three Target Roles", description: "Use your tailored resume for each application — quality over volume", done: false, week: "Week 3–4", sort_order: 5 },
      { user_id: user.id, title: "Schedule a Mock Interview", description: "Practice with Renova's AI interview coach and refine your career break narrative", done: false, week: "Week 4", sort_order: 6 },
      { user_id: user.id, title: "Celebrate Your First Interview", description: "A significant milestone that deserves recognition — you have earned it", done: false, week: "Week 5+", sort_order: 7 },
    ]);
    console.log("  ✓ Roadmap (7 milestones)\n");

    // 11. Create dashboard metrics
    console.log("  Creating dashboard metrics...");
    await supabase.from("dashboard_metrics").upsert({
      user_id: user.id,
      comeback_score: 78,
      confidence_history: [20, 28, 35, 42, 50, 58, 65],
      skills_data: [
        { skill: "Marketing", val: 88 },
        { skill: "Writing", val: 92 },
        { skill: "Strategy", val: 75 },
        { skill: "Analytics", val: 58 },
        { skill: "AI Tools", val: 42 },
        { skill: "Leadership", val: 80 },
      ],
      apps_sent: 3,
      profile_strength: 85,
    }, { onConflict: "user_id" });
    console.log("  ✓ Dashboard metrics\n");

    // 12. Create community posts
    console.log("  Creating community posts...");
    for (const post of SEED_POSTS) {
      await supabase.from("posts").insert({
        user_id: user.id,
        ...post,
      });
    }
    console.log("  ✓ Community posts (4 posts)\n");

    console.log("─────────────────────────────────────────────────");
    console.log("✅ Seed complete!");
    console.log(`   Login: alex@demo.com / password123`);
    console.log("─────────────────────────────────────────────────\n");
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();
