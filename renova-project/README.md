<p align="center">
  <img src="./img.png" alt="Renova Banner" width="100%">
</p>

# Renova 🎯

**AI-Powered Career Re-Entry Platform for Women**

## Basic Details

### Team Name: Jarvis

### Team Members
- Member 1: Ganga Gireesh - Toc H Institute of Science and Technology
- Member 2: Krishnapriya Rajeev - Toc H Institute of Science and Technology

### Hosted Project Link
- **Frontend:** [https://renova-frontend.vercel.app](https://renova-frontend.vercel.app)
- **Backend API:** [https://renova-119i.vercel.app/api](https://renova-119i.vercel.app/api)

### Project Description
Many women struggle to return to work after maternity breaks due to rapid industry changes, evolving skill requirements, and a loss of confidence. Renova is a career re-entry platform designed to support women during this transition. It assesses their experience, break duration, and professional background to provide a personalized evaluation and a clear, structured roadmap. By identifying skill gaps and offering targeted guidance, Renova helps women regain confidence and re-enter the workforce with clarity and direction.

### The Problem Statement
Women returning to work after maternity or extended career breaks often face rapid industry changes that make their previous skills less relevant. Many struggle with reduced professional confidence and a lack of structured guidance to restart their careers. Flexible and returnship-friendly opportunities are difficult to find, and most existing platforms ignore career gaps, focusing only on job listings rather than true readiness and support.

### The Solution
Renova addresses this challenge by providing an AI-powered, structured career re-entry pathway tailored specifically for women returning after a break. It evaluates their previous experience, career gap duration, and current skill relevance to generate personalized role recommendations and a clear, step-by-step roadmap. By identifying skill gaps, offering guided upskilling plans, tracking confidence growth, and highlighting flexible opportunities, Renova transforms uncertainty into clarity — helping women rebuild confidence and re-enter the workforce with direction and purpose.

---

## Technical Details

### Technologies Used

**Languages:**
- JavaScript (ES6+)

**Frontend:**
- React 18 (Create React App)
- Styled Components / CSS-in-JS
- Context API for state management

**Backend:**
- Node.js with Express 4
- JWT (JSON Web Tokens) for authentication
- bcrypt.js for password hashing
- Multer for file uploads (avatars, banners, resumes)
- Express Rate Limiting for API security

**Database:**
- Supabase (PostgreSQL)

**AI/ML:**
- Google Gemini AI — personalized career chat, resume review, break explanation generation

**Deployment:**
- Vercel (frontend + backend serverless functions)

**Tools:**
- VS Code, Git, GitHub, Vercel CLI, Supabase Dashboard

---

## Features

- **Personalized Onboarding** — Collects career break duration, last role, industry, skills, confidence level, and career goals to build a tailored profile.
- **AI-Powered Dashboard** — Displays career readiness score, confidence tracker, skill radar charts, and daily motivational reminders.
- **Smart Recommendations** — Suggests relevant job roles, courses, and re-entry opportunities based on the user's profile and skill gaps.
- **Career Roadmap** — Generates a step-by-step milestone roadmap with progress tracking to guide users back into the workforce.
- **Rich Profile Builder** — Full profile with experience, education, certifications, achievements, volunteering, languages, resume upload, and custom avatars/banners.
- **AI Career Chat** — Powered by Google Gemini — provides career advice, resume reviews, and personalized break explanations.
- **Community Forum** — Users can share experiences, post anonymously, like and comment on posts for peer support.
- **CV Analysis** — AI-powered resume review that identifies strengths, gaps, and improvement suggestions.
- **Confidence Tracking** — Logs and visualizes confidence growth over time with interactive charts.
- **Responsive Design** — Beautiful, mobile-friendly UI with elegant typography and gradient themes.

---

## Implementation

### Project Structure

```
renova-project/
├── backend/                  # Express.js REST API
│   ├── server.js             # Main server entry point
│   ├── config/supabase.js    # Supabase client configuration
│   ├── middleware/auth.js    # JWT authentication middleware
│   ├── routes/               # API route handlers
│   │   ├── auth.js           # Signup, login, logout, session
│   │   ├── onboarding.js     # Onboarding flow
│   │   ├── profile.js        # Profile CRUD + file uploads
│   │   ├── dashboard.js      # Metrics, confidence, reminders
│   │   ├── recommendations.js# Job/course recommendations
│   │   ├── roadmap.js        # Career roadmap milestones
│   │   ├── community.js      # Community posts, likes, comments
│   │   └── gemini.js         # AI chat, resume review, break explanation
│   ├── services/             # Business logic
│   │   ├── geminiService.js  # Google Gemini AI integration
│   │   ├── recommendationEngine.js
│   │   └── roadmapEngine.js
│   └── database/
│       └── schema.sql        # Supabase PostgreSQL schema
│
└── renova/                   # React frontend (CRA)
    ├── src/
    │   ├── App.js            # Main app with page routing
    │   ├── context/AuthContext.js  # Auth state management
    │   ├── pages/            # All application pages
    │   │   ├── LandingPage.jsx
    │   │   ├── AuthPages.jsx
    │   │   ├── OnboardingPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── RecommendationsPage.jsx
    │   │   ├── RoadmapPage.jsx
    │   │   └── CommunityPage.jsx
    │   ├── components/       # Reusable UI components
    │   └── styles/           # Global styles & themed components
    └── vercel.json           # Vercel deployment config
```

### Installation

**Prerequisites:** Node.js 18+, npm, a Supabase project, and a Google Gemini API key.

```bash
# Clone the repository
git clone https://github.com/krishnapriyaaahh/renova.git
cd renova/renova-project
```

**Backend setup:**
```bash
cd backend
npm install

# Create .env file from example
cp .env.example .env
# Fill in your values:
#   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
#   JWT_SECRET, GEMINI_API_KEY, CLIENT_URL
```

**Frontend setup:**
```bash
cd renova
npm install
```

**Database setup:**
- Go to your Supabase project → SQL Editor
- Run the contents of `backend/database/schema.sql`

### Run Locally

```bash
# Terminal 1 — Start backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Start frontend (port 3000)
cd renova
npm start
```

Visit `http://localhost:3000` to use the app.

---

## API Documentation

**Base URL:** `https://renova-119i.vercel.app/api`

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Sign in with email & password |
| POST | `/api/auth/logout` | Sign out (client-side) |
| GET | `/api/auth/me` | Get current user from JWT token |

### Onboarding

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/onboarding` | Save onboarding data |
| GET | `/api/onboarding` | Get onboarding data |
| PUT | `/api/onboarding` | Update onboarding data |

### Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get user profile |
| PUT | `/api/profile` | Update profile fields |
| POST | `/api/profile/resume` | Upload resume |
| POST | `/api/profile/avatar` | Upload avatar image |
| POST | `/api/profile/banner` | Upload banner image |
| POST/PUT/DELETE | `/api/profile/{section}[/:id]` | Manage experience, education, certifications, achievements, volunteering, languages |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/metrics` | Get dashboard metrics |
| PUT | `/api/dashboard/metrics` | Update metrics |
| POST | `/api/dashboard/confidence` | Log confidence entry |
| GET | `/api/dashboard/reminder` | Get daily motivational reminder |

### Recommendations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recommendations` | Get personalized recommendations |
| POST | `/api/recommendations/:id/save` | Save a recommendation |
| DELETE | `/api/recommendations/:id/save` | Unsave a recommendation |
| GET | `/api/recommendations/saved` | Get saved recommendations |

### Roadmap

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/roadmap` | Get career roadmap milestones |
| PATCH | `/api/roadmap/:id` | Toggle milestone completion |
| POST | `/api/roadmap` | Add a new milestone |
| PUT | `/api/roadmap/:id` | Update a milestone |
| DELETE | `/api/roadmap/:id` | Delete a milestone |

### Community

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/community/posts` | Get community feed |
| POST | `/api/community/posts` | Create a new post |
| POST | `/api/community/posts/:id/like` | Like/unlike a post |
| GET | `/api/community/posts/:id/comments` | Get comments on a post |
| POST | `/api/community/posts/:id/comments` | Add a comment |
| DELETE | `/api/community/posts/:id` | Delete a post |

### AI (Gemini)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | AI career chat conversation |
| POST | `/api/ai/break-explanation` | Generate career break explanation |
| POST | `/api/ai/resume-review` | AI-powered resume review |
| GET | `/api/ai/history` | Get chat history |
| DELETE | `/api/ai/history` | Clear chat history |

---

## Project Demo

### Video
*Add demo video link here*

### Live Demo
- **Frontend:** [https://renova-frontend.vercel.app](https://renova-frontend.vercel.app)
- **Backend Health Check:** [https://renova-119i.vercel.app/api/health](https://renova-119i.vercel.app/api/health)

---

## AI Tools Used

**Tool Used:** GitHub Copilot (Claude)

**Purpose:**
- Backend and frontend scaffolding and debugging
- Deployment configuration for Vercel
- API integration and CORS troubleshooting
- Code optimization and refactoring

**Human Contributions:**
- Overall architecture design and planning
- UI/UX design and styling decisions
- Business logic for recommendation and roadmap engines
- Database schema design
- Testing and validation

---

## Team Contributions

- **Ganga Gireesh:** Backend development, API design, database schema, AI integration (Gemini), deployment configuration
- **Krishnapriya Rajeev:** Frontend development, UI/UX design, React components, styling, community features

---

## License

This project is licensed under the MIT License.

---

Made with ❤️ at TinkerHub