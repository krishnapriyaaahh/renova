-- ============================================================================
-- Migration: Add JSONB data column to saved_recommendations
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Drop the FK constraint since recommendation IDs are generated dynamically
ALTER TABLE saved_recommendations
  DROP CONSTRAINT IF EXISTS saved_recommendations_recommendation_id_fkey;

-- Change recommendation_id to TEXT (dynamic IDs aren't real UUIDs)
ALTER TABLE saved_recommendations
  ALTER COLUMN recommendation_id TYPE TEXT USING recommendation_id::TEXT;

-- Add a JSONB column to store the full recommendation snapshot
ALTER TABLE saved_recommendations
  ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';
