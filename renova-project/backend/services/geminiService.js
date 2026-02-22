// ─── Google Gemini AI Service ────────────────────────────────────────────────
// Provides AI-powered career coaching, interview prep, and resume feedback
// ────────────────────────────────────────────────────────────────────────────

const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = null;
let model = null;
let modelLite = null;

// Models in priority order — if one is rate-limited, try the next
const MODEL_PRIMARY = "gemini-2.5-flash";
const MODEL_FALLBACK = "gemini-2.0-flash-lite";
const MODEL_LEGACY = "gemma-3-4b-it";

function initGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your-gemini-api-key") {
    console.warn("⚠️  GEMINI_API_KEY not configured. AI features will return fallback responses.");
    return false;
  }
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: MODEL_PRIMARY });
  modelLite = genAI.getGenerativeModel({ model: MODEL_FALLBACK });
  return true;
}

/**
 * Generate content with automatic retry + model fallback on 429/503 errors
 */
async function generateWithRetry(prompt, maxRetries = 3) {
  const models = [model, modelLite];
  if (genAI) {
    try { models.push(genAI.getGenerativeModel({ model: MODEL_LEGACY })); } catch {}
  }

  for (const m of models) {
    if (!m) continue;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await m.generateContent(prompt);
        return result;
      } catch (err) {
        const status = err.status || err.httpStatusCode || 0;
        const isRetryable = status === 429 || status === 503 || status === 500;
        if (isRetryable && attempt < maxRetries - 1) {
          const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 500, 15000);
          console.warn(`Gemini ${status} on ${m.model || "model"}, retry ${attempt + 1}/${maxRetries} in ${Math.round(delay)}ms...`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        if (isRetryable) {
          console.warn(`Gemini ${status} exhausted retries on model, trying next model...`);
          break; // try next model
        }
        throw err; // non-retryable error
      }
    }
  }
  throw new Error("All Gemini models exhausted (rate limited). Please try again later.");
}

// ─── System prompts for different contexts ──────────────────────────────────
const SYSTEM_PROMPTS = {
  general: `You are Renova AI, a warm, empathetic, and knowledgeable career comeback coach. 
You specialize in helping professionals who have taken career breaks (for caregiving, health, 
personal reasons, or any other reason) return to the workforce with confidence.

Key principles:
- Always be encouraging and supportive — never judgmental about career gaps
- Provide specific, actionable advice rather than generic platitudes
- Acknowledge the courage it takes to return after a break
- Frame career breaks as a source of unique strengths and perspectives
- Keep responses concise (2-4 paragraphs) unless asked for more detail
- Use professional but warm language`,

  interview: `You are Renova AI, an expert interview coach for career returners.
Help the user practice answering interview questions, especially about career breaks.

Key principles:
- Teach the user to frame their career break positively and authentically
- Provide specific example answers they can adapt
- Give constructive feedback on practice responses
- Cover common questions: "Tell me about your gap", "Why now?", "Are your skills current?"
- Suggest the STAR method for behavioral questions
- Keep advice practical and confidence-building`,

  resume: `You are Renova AI, a professional resume and profile reviewer for career returners.
Help users craft compelling resumes and LinkedIn profiles.

Key principles:
- Advise on how to present career breaks honestly and positively
- Suggest strong action verbs and quantified achievements
- Help restructure experience to highlight transferable skills
- Recommend modern resume formats that work well for returners
- Keep suggestions specific to the user's background`,

  skills: `You are Renova AI, a career skills advisor for returning professionals.
Help users identify their transferable skills and create learning plans.

Key principles:
- Map existing skills to current market demands
- Suggest specific courses, certifications, or projects to fill gaps
- Emphasize skills gained during career breaks (time management, empathy, adaptability)
- Provide realistic timelines for upskilling
- Recommend free or affordable learning resources`,
};

/**
 * Generate a response from Gemini AI
 * @param {object} params
 * @param {string} params.message — User's message
 * @param {string} params.context — Conversation context type
 * @param {object[]} params.history — Previous messages [{ role, message }]
 * @param {object} params.userProfile — User's profile data for personalization
 * @returns {Promise<string>}
 */
async function generateResponse({ message, context = "general", history = [], userProfile = null }) {
  // If Gemini is not configured, return a helpful fallback
  if (!model) {
    return getFallbackResponse(context, message);
  }

  try {
    const systemPrompt = SYSTEM_PROMPTS[context] || SYSTEM_PROMPTS.general;

    // Build personalization context from user profile
    let personalContext = "";
    if (userProfile) {
      personalContext = `\n\nUser context:
- Name: ${userProfile.name || "Unknown"}
- Skills: ${(userProfile.skills || []).join(", ") || "Not specified"}
- Goal: ${userProfile.goal || "Not specified"}
- Career break: ${userProfile.career_break_years || "Not specified"}
- Last role: ${userProfile.last_role || "Not specified"}`;
    }

    // Build conversation history for multi-turn
    const chatHistory = history.slice(-10).map((h) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.message }],
    }));

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "Please follow these instructions for our conversation:" }] },
        { role: "model", parts: [{ text: systemPrompt + personalContext + "\n\nUnderstood. I'm ready to help." }] },
        ...chatHistory,
      ],
    });

    let response;
    try {
      const result = await chat.sendMessage(message);
      response = result.response.text();
    } catch (chatErr) {
      // If chat fails (rate limit etc), try a simple prompt via retry logic
      const status = chatErr.status || 0;
      if (status === 429 || status === 503) {
        console.warn(`Chat rate-limited (${status}), falling back to generateWithRetry...`);
        const singlePrompt = `${systemPrompt}${personalContext}\n\nConversation so far:\n${history.slice(-5).map(h => `${h.role}: ${h.message}`).join('\n')}\n\nUser: ${message}\n\nRespond helpfully:`;
        const fallbackResult = await generateWithRetry(singlePrompt);
        response = fallbackResult.response.text();
      } else {
        throw chatErr;
      }
    }

    return response;
  } catch (err) {
    console.error("Gemini API error:", err);
    return getFallbackResponse(context, message);
  }
}

/**
 * Generate career break explanation suggestions
 */
async function generateBreakExplanation({ breakReason, duration, skills = [] }) {
  if (!model) {
    return {
      short: "I took a deliberate career break and I'm returning with renewed focus, updated skills, and a clearer sense of what I want to contribute.",
      interview: "I made an intentional decision to step away for personal reasons. During that time, I stayed engaged through continued learning and volunteer work. I'm now energized and ready to bring my refreshed perspective to a team.",
      linkedin: `Career Break | ${duration || "2+ years"}\nTook an intentional career pause. Used this time to upskill in ${skills.slice(0, 3).join(", ") || "emerging industry tools"} and gain fresh perspective. Now returning with renewed purpose and expertise.`,
    };
  }

  try {
    const prompt = `Generate three versions of a career break explanation for someone who:
- Break reason: ${breakReason || "personal/caregiving"}
- Duration: ${duration || "2+ years"}  
- Skills maintained/gained: ${skills.join(", ") || "various professional skills"}

Provide exactly this JSON format (no markdown, just raw JSON):
{
  "short": "A 1-2 sentence elevator pitch version",
  "interview": "A 3-4 sentence interview response",
  "linkedin": "A LinkedIn summary paragraph"
}`;

    const result = await generateWithRetry(prompt);
    const text = result.response.text();
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { short: text, interview: text, linkedin: text };
  } catch (err) {
    console.error("Break explanation error:", err);
    return getFallbackResponse("break", "");
  }
}

/**
 * Analyze and score a resume
 */
async function analyzeResume(resumeText, userContext = {}) {
  if (!model) {
    return {
      score: 72,
      rating: "Good",
      overall_chance: 68,
      category_scores: {
        content: 75,
        formatting: 70,
        impact: 65,
        keywords_ats: 72,
        brevity: 78,
      },
      strengths: ["Clear professional experience", "Good use of action verbs", "Relevant industry background"],
      improvements: ["Add quantified achievements with metrics", "Include a career break narrative section", "Update skills section with current in-demand tools", "Add a strong professional summary at the top"],
      keywords: ["Leadership", "Project Management", "Communication", "Problem Solving"],
      missing_keywords: ["Data Analysis", "Agile", "Cloud Computing"],
      suggestion: "Consider adding a brief, positive statement about your career break at the top of your resume. Frame it as an intentional decision that helped you grow.",
      summary: "Your CV shows solid professional experience. To strengthen it for a career comeback, focus on quantifying achievements, updating your skills section, and adding a confident career break narrative.",
      ats_friendly: true,
      experience_level: "Mid-Level",
    };
  }

  try {
    const prompt = `You are an expert career coach, CV reviewer, and ATS (Applicant Tracking System) specialist. You help career returners optimize their resumes for maximum impact.

Analyze this resume/CV thoroughly and provide a comprehensive, detailed assessment.

Resume text:
${resumeText}

User context: ${JSON.stringify(userContext)}

Provide your analysis as JSON with this EXACT format (no markdown, no code fences, just raw JSON):
{
  "score": <number 0-100, overall quality score>,
  "rating": "<one of: Excellent, Very Good, Good, Needs Work, Poor>",
  "overall_chance": <number 0-100, estimated chance of getting shortlisted for a relevant role>,
  "category_scores": {
    "content": <number 0-100, quality of content & achievements>,
    "formatting": <number 0-100, layout, readability, structure>,
    "impact": <number 0-100, strength of action verbs & quantified results>,
    "keywords_ats": <number 0-100, keyword optimization & ATS compatibility>,
    "brevity": <number 0-100, conciseness, no fluff>
  },
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "improvements": ["specific actionable improvement 1", "specific improvement 2", "specific improvement 3", "specific improvement 4"],
  "keywords": ["detected keyword 1", "detected keyword 2", "keyword 3", "keyword 4", "keyword 5"],
  "missing_keywords": ["important missing keyword 1", "missing keyword 2", "missing keyword 3"],
  "suggestion": "The single most impactful thing they should change RIGHT NOW",
  "summary": "A 2-3 sentence overall assessment of the CV with encouragement",
  "ats_friendly": <true or false>,
  "experience_level": "<one of: Entry-Level, Mid-Level, Senior, Executive>"
}

IMPORTANT:
- Be encouraging but honest — this person may be returning from a career break
- Score fairly — most real CVs land between 50-85
- Provide SPECIFIC, ACTIONABLE improvements, not generic platitudes
- Detect real keywords from the resume text
- missing_keywords should be industry-relevant keywords they SHOULD add
- overall_chance reflects realistic shortlisting probability for roles matching their experience`;

    const result = await generateWithRetry(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: parsed.score || 70,
        rating: parsed.rating || "Good",
        overall_chance: parsed.overall_chance || 60,
        category_scores: parsed.category_scores || { content: 70, formatting: 70, impact: 65, keywords_ats: 60, brevity: 70 },
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
        keywords: parsed.keywords || [],
        missing_keywords: parsed.missing_keywords || [],
        suggestion: parsed.suggestion || "",
        summary: parsed.summary || "",
        ats_friendly: parsed.ats_friendly ?? true,
        experience_level: parsed.experience_level || "Mid-Level",
      };
    }
    return { score: 70, rating: "Good", overall_chance: 60, category_scores: {}, strengths: [], improvements: [], keywords: [], missing_keywords: [], suggestion: text, summary: "", ats_friendly: true, experience_level: "Unknown" };
  } catch (err) {
    console.error("Resume analysis error:", err);
    return { score: 0, rating: "Error", overall_chance: 0, category_scores: {}, strengths: [], improvements: ["Unable to analyze at this time. Please try again."], keywords: [], missing_keywords: [], suggestion: "Please try uploading your CV again.", summary: "We couldn't analyze your CV right now. This might be a temporary issue — please try again.", ats_friendly: false, experience_level: "Unknown" };
  }
}

// ─── Fallback responses when Gemini is not available ────────────────────────
function getFallbackResponse(context, message) {
  const fallbacks = {
    general: "I'm Renova AI, your career comeback coach. While my AI capabilities are being configured, here's a quick tip: The most important thing about returning to work after a break is to approach it with confidence. Your career break gave you unique perspectives and skills that employers genuinely value. Start by updating your LinkedIn profile and reaching out to three former colleagues this week.",
    interview: "Here's a strong way to address a career break in interviews: 'I took an intentional break to [reason]. During that time, I [what you did — courses, volunteering, projects]. I'm returning now because [motivation], and I'm bringing back [specific updated skill]. I'm excited about this role because [connection to role].' Practice this framework with your own details and you'll feel much more confident.",
    resume: "Key resume tips for career returners: 1) Use a combination format that highlights skills alongside experience. 2) Include a brief 'Career Break' entry that's honest and positive. 3) Add any certifications, courses, or volunteer work from your break period. 4) Lead with a strong summary statement that focuses on what you bring, not what you missed.",
    skills: "Transferable skills to highlight from your career break: project management, adaptability, communication, time management, problem-solving, empathy, and resilience. These soft skills are increasingly valued by employers. Pair them with one or two technical upskills (like Google Analytics certification or an AI tools course) and you'll have a compelling skills profile.",
    break: "I took a deliberate career break and I'm returning with renewed focus and updated skills.",
  };

  return fallbacks[context] || fallbacks.general;
}

module.exports = { initGemini, generateResponse, generateBreakExplanation, analyzeResume };
