# Renova — Career Re-Entry Platform

A beautifully designed React app helping women return to work with confidence.

## Quick Start

```bash
# 1. Install Node.js v18+ from https://nodejs.org

# 2. Install dependencies
npm install

# 3. Start the dev server
npm start
# → Opens at http://localhost:3000
```

## Project Structure

```
renova/
├── public/
│   └── index.html
├── src/
│   ├── App.js                      # Root app, routing, auth state
│   ├── index.js                    # React DOM entry point
│   │
│   ├── context/
│   │   └── AuthContext.js          # Auth context & hook
│   │
│   ├── data/
│   │   └── mockData.js             # All mock data (recommendations, profile, etc.)
│   │
│   ├── styles/
│   │   └── GlobalStyles.js         # Google Font loader + injected CSS
│   │
│   ├── components/
│   │   ├── Navbar.jsx              # Sticky navigation bar
│   │   ├── BackBtn.jsx             # Back navigation button
│   │   ├── HeroVisual.jsx          # Animated SVG hero graphic
│   │   ├── Charts.jsx              # CircProg, Radar, MiniLine SVG charts
│   │   └── AuthComponents.jsx     # Field, PwStrength, AuthWrap layout
│   │
│   └── pages/
│       ├── LandingPage.jsx         # Marketing landing page
│       ├── AuthPages.jsx           # LoginPage + SignupPage
│       ├── OnboardingPage.jsx      # Multi-step onboarding flow
│       ├── DashboardPage.jsx       # Main dashboard with metrics
│       ├── RecommendationsPage.jsx # AI-matched job opportunities
│       ├── RoadmapPage.jsx         # Interactive milestone tracker
│       ├── ProfilePage.jsx         # Editable career profile
│       └── CommunityPage.jsx       # Community posts feed
│
├── package.json
└── requirements.txt
```

## No External UI Libraries Required

All styling uses inline styles + a small injected CSS file.  
All charts are pure SVG — no chart library needed.  
The only dependency is React itself.

## Demo Credentials

Any email/password combination will work on the login page.  
The app uses mock data — no backend required.
