-- Capture DB-side artifacts missing from the Prisma baseline (0_init).
-- These already exist in the live DB from the original Supabase migration.
-- This file documents them for reproducibility: a fresh DB rebuilt from
-- Prisma migrations alone would lack these artifacts.
--
-- Idempotent: uses DO blocks to skip if objects already exist.

-- ─── CHECK constraint on posts.status ──────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'posts_status_check'
      AND conrelid = 'posts'::regclass
  ) THEN
    ALTER TABLE "posts"
      ADD CONSTRAINT "posts_status_check"
      CHECK ("status" IN ('draft', 'published'));
  END IF;
END $$;

-- ─── update_updated_at() function + trigger ────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_updated_at ON posts;
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Row Level Security ────────────────────────────────────
-- Single-tenant (no auth): anon + authenticated get full CRUD.

ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

-- Authors policies
DROP POLICY IF EXISTS "anon_select_authors" ON authors;
CREATE POLICY "anon_select_authors" ON authors FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_authors" ON authors;
CREATE POLICY "anon_insert_authors" ON authors FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_authors" ON authors;
CREATE POLICY "anon_update_authors" ON authors FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_authors" ON authors;
CREATE POLICY "anon_delete_authors" ON authors FOR DELETE TO anon, authenticated USING (true);

-- Categories policies
DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
CREATE POLICY "anon_insert_categories" ON categories FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_categories" ON categories;
CREATE POLICY "anon_update_categories" ON categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
CREATE POLICY "anon_delete_categories" ON categories FOR DELETE TO anon, authenticated USING (true);

-- Posts policies
DROP POLICY IF EXISTS "anon_select_posts" ON posts;
CREATE POLICY "anon_select_posts" ON posts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_posts" ON posts;
CREATE POLICY "anon_insert_posts" ON posts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_posts" ON posts;
CREATE POLICY "anon_update_posts" ON posts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_posts" ON posts;
CREATE POLICY "anon_delete_posts" ON posts FOR DELETE TO anon, authenticated USING (true);

-- Tags policies
DROP POLICY IF EXISTS "anon_select_tags" ON tags;
CREATE POLICY "anon_select_tags" ON tags FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_tags" ON tags;
CREATE POLICY "anon_insert_tags" ON tags FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_tags" ON tags;
CREATE POLICY "anon_update_tags" ON tags FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_tags" ON tags;
CREATE POLICY "anon_delete_tags" ON tags FOR DELETE TO anon, authenticated USING (true);

-- Post-tags policies
DROP POLICY IF EXISTS "anon_select_post_tags" ON post_tags;
CREATE POLICY "anon_select_post_tags" ON post_tags FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_post_tags" ON post_tags;
CREATE POLICY "anon_insert_post_tags" ON post_tags FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_post_tags" ON post_tags;
CREATE POLICY "anon_delete_post_tags" ON post_tags FOR DELETE TO anon, authenticated USING (true);
