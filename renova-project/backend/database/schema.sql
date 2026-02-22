-- ============================================================================
-- Renova — Supabase Database Schema
-- Run this SQL in Supabase SQL Editor to create all tables
-- ============================================================================

-- ─── Enable UUID extension ──────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users ──────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Onboarding ─────────────────────────────────────────────────────────────
CREATE TABLE onboarding (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  career_break_years TEXT,
  last_role       TEXT,
  industry        TEXT,
  skills          TEXT[] DEFAULT '{}',
  confidence      INTEGER DEFAULT 50,
  goal            TEXT CHECK (goal IN ('same-role','pivot','flexible','leadership','freelance')),
  completed       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Profiles ───────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  headline      TEXT DEFAULT '',
  location      TEXT DEFAULT '',
  website       TEXT DEFAULT '',
  about         TEXT DEFAULT '',
  career_break  TEXT DEFAULT '',
  skills        TEXT[] DEFAULT '{}',
  open_to       TEXT[] DEFAULT '{}',
  target_roles  TEXT[] DEFAULT '{}',
  banner_index  INTEGER DEFAULT 0,
  avatar_url    TEXT DEFAULT '',
  banner_url    TEXT DEFAULT '',
  resume_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CV Analysis ────────────────────────────────────────────────────────────
CREATE TABLE cv_analysis (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  file_name       TEXT DEFAULT '',
  file_url        TEXT DEFAULT '',
  score           INTEGER DEFAULT 0,
  strengths       TEXT[] DEFAULT '{}',
  improvements    TEXT[] DEFAULT '{}',
  keywords        TEXT[] DEFAULT '{}',
  suggestion      TEXT DEFAULT '',
  summary         TEXT DEFAULT '',
  analyzed_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Experience ─────────────────────────────────────────────────────────────
CREATE TABLE experience (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  company     TEXT NOT NULL,
  location    TEXT DEFAULT '',
  start_date  TEXT NOT NULL,
  end_date    TEXT,
  is_current  BOOLEAN DEFAULT FALSE,
  description TEXT DEFAULT '',
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Education ──────────────────────────────────────────────────────────────
CREATE TABLE education (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree      TEXT NOT NULL,
  years       TEXT DEFAULT '',
  grade       TEXT DEFAULT '',
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Certifications ─────────────────────────────────────────────────────────
CREATE TABLE certifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  issuer      TEXT NOT NULL,
  year        TEXT DEFAULT '',
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Achievements ───────────────────────────────────────────────────────────
CREATE TABLE achievements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  org         TEXT DEFAULT '',
  year        TEXT DEFAULT '',
  description TEXT DEFAULT '',
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Volunteering ───────────────────────────────────────────────────────────
CREATE TABLE volunteering (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  org         TEXT NOT NULL,
  role        TEXT DEFAULT '',
  years       TEXT DEFAULT '',
  description TEXT DEFAULT '',
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Languages ──────────────────────────────────────────────────────────────
CREATE TABLE languages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  level       TEXT DEFAULT 'Conversational',
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Recommendations (Job Roles) ────────────────────────────────────────────
CREATE TABLE recommendations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  company     TEXT NOT NULL,
  match_score INTEGER DEFAULT 0,
  skill_gaps  TEXT[] DEFAULT '{}',
  salary      TEXT DEFAULT '',
  work_type   TEXT DEFAULT 'Remote',
  description TEXT DEFAULT '',
  category    TEXT CHECK (category IN ('direct','adjacent','replacement')) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Saved Recommendations (many-to-many) ───────────────────────────────────
CREATE TABLE saved_recommendations (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  recommendation_id UUID REFERENCES recommendations(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recommendation_id)
);

-- ─── Roadmap ────────────────────────────────────────────────────────────────
CREATE TABLE roadmap (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  done        BOOLEAN DEFAULT FALSE,
  week        TEXT DEFAULT '',
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Community Posts ────────────────────────────────────────────────────────
CREATE TABLE posts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  tags        TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Post Likes ─────────────────────────────────────────────────────────────
CREATE TABLE post_likes (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id   UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- ─── Comments ───────────────────────────────────────────────────────────────
CREATE TABLE comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id     UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Dashboard Metrics (computed/cached per user) ───────────────────────────
CREATE TABLE dashboard_metrics (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  comeback_score      INTEGER DEFAULT 0,
  confidence_history  INTEGER[] DEFAULT '{20}',
  skills_data         JSONB DEFAULT '[]',
  apps_sent           INTEGER DEFAULT 0,
  profile_strength    INTEGER DEFAULT 0,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AI Chat History ────────────────────────────────────────────────────────
CREATE TABLE ai_conversations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT CHECK (role IN ('user','assistant')) NOT NULL,
  message     TEXT NOT NULL,
  context     TEXT DEFAULT 'general',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX idx_experience_profile ON experience(profile_id);
CREATE INDEX idx_education_profile ON education(profile_id);
CREATE INDEX idx_certifications_profile ON certifications(profile_id);
CREATE INDEX idx_achievements_profile ON achievements(profile_id);
CREATE INDEX idx_volunteering_profile ON volunteering(profile_id);
CREATE INDEX idx_languages_profile ON languages(profile_id);
CREATE INDEX idx_roadmap_user ON roadmap(user_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_saved_recs_user ON saved_recommendations(user_id);
CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id, created_at);

-- ─── Row Level Security ─────────────────────────────────────────────────────
-- Enable RLS on all user-scoped tables (policies are enforced via service role
-- key in the backend; frontend never talks to Supabase directly)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteering ENABLE ROW LEVEL SECURITY;
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (backend uses service role key)
CREATE POLICY "Service role full access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON onboarding FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON experience FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON education FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON certifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON achievements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON volunteering FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON languages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON roadmap FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON post_likes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON dashboard_metrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON ai_conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON saved_recommendations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON recommendations FOR ALL USING (true) WITH CHECK (true);
