# Renova Backend API

Career Comeback Platform — Node.js + Express + Supabase REST API

## Tech Stack

| Layer              | Technology                          |
|--------------------|-------------------------------------|
| Runtime            | Node.js                             |
| Framework          | Express.js                          |
| Database           | Supabase (PostgreSQL)               |
| Authentication     | JWT (jsonwebtoken + bcryptjs)       |
| AI                 | Google Gemini 1.5 Flash             |
| Recommendations    | Rule-based matching engine          |
| File Uploads       | Multer → Supabase Storage           |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
#    Copy .env.example → .env and fill in your Supabase + Gemini keys
cp .env.example .env

# 3. Run the database schema in Supabase SQL Editor
#    Copy contents of database/schema.sql

# 4. (Optional) Seed demo data
npm run seed

# 5. Start development server
npm run dev

# Server runs at http://localhost:5000
# API docs at  http://localhost:5000/api
```

## API Endpoints

### Auth
| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| POST   | /api/auth/signup    | Register new user    |
| POST   | /api/auth/login     | Sign in              |
| POST   | /api/auth/logout    | Sign out             |
| GET    | /api/auth/me        | Get current user     |

### Onboarding
| Method | Endpoint           | Description              |
|--------|--------------------|--------------------------|
| POST   | /api/onboarding    | Save onboarding data     |
| GET    | /api/onboarding    | Get onboarding data      |
| PUT    | /api/onboarding    | Update onboarding        |

### Profile
| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| GET    | /api/profile                      | Get full profile         |
| PUT    | /api/profile                      | Update profile fields    |
| POST   | /api/profile/resume               | Upload resume            |
| POST   | /api/profile/{section}            | Add sub-section entry    |
| PUT    | /api/profile/{section}/:id        | Update sub-section entry |
| DELETE | /api/profile/{section}/:id        | Remove sub-section entry |

Sections: `experience`, `education`, `certifications`, `achievements`, `volunteering`, `languages`

### Dashboard
| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /api/dashboard/metrics      | Get dashboard metrics    |
| PUT    | /api/dashboard/metrics      | Update metrics           |
| POST   | /api/dashboard/confidence   | Log confidence entry     |
| GET    | /api/dashboard/reminder     | Get daily reminder       |

### Recommendations
| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| GET    | /api/recommendations              | Get AI-matched roles     |
| POST   | /api/recommendations/:id/save     | Save recommendation      |
| DELETE | /api/recommendations/:id/save     | Unsave recommendation    |
| GET    | /api/recommendations/saved        | Get saved list           |

### Roadmap
| Method | Endpoint            | Description              |
|--------|---------------------|--------------------------|
| GET    | /api/roadmap        | Get milestones           |
| POST   | /api/roadmap        | Add custom milestone     |
| PATCH  | /api/roadmap/:id    | Toggle done status       |
| PUT    | /api/roadmap/:id    | Update milestone         |
| DELETE | /api/roadmap/:id    | Delete milestone         |

### Community
| Method | Endpoint                             | Description          |
|--------|--------------------------------------|----------------------|
| GET    | /api/community/posts                 | Get feed             |
| POST   | /api/community/posts                 | Create post          |
| POST   | /api/community/posts/:id/like        | Like/unlike          |
| GET    | /api/community/posts/:id/comments    | Get comments         |
| POST   | /api/community/posts/:id/comments    | Add comment          |
| DELETE | /api/community/posts/:id             | Delete post          |

### AI (Gemini)
| Method | Endpoint                       | Description                 |
|--------|--------------------------------|-----------------------------|
| POST   | /api/ai/chat                   | Chat with AI coach          |
| POST   | /api/ai/break-explanation      | Generate break explanations |
| POST   | /api/ai/resume-review          | Analyze resume              |
| GET    | /api/ai/history                | Get chat history            |
| DELETE | /api/ai/history                | Clear chat history          |

## Authentication

All protected endpoints require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

Tokens are returned from `/api/auth/signup` and `/api/auth/login`.

## Environment Variables

| Variable                  | Required | Description                    |
|---------------------------|----------|--------------------------------|
| PORT                      | No       | Server port (default: 5000)    |
| NODE_ENV                  | No       | development / production       |
| SUPABASE_URL              | Yes      | Supabase project URL           |
| SUPABASE_SERVICE_ROLE_KEY | Yes      | Supabase service role key      |
| JWT_SECRET                | Yes      | Secret for signing JWTs        |
| JWT_EXPIRES_IN            | No       | Token expiry (default: 7d)     |
| GEMINI_API_KEY            | No       | Google Gemini API key          |
| CLIENT_URL                | No       | Frontend URL for CORS          |
