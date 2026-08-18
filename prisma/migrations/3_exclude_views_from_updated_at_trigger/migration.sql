-- Exclude views-only updates from the updated_at trigger.
--
-- The capture migration (2_capture_rls_check_trigger) replicated the original
-- Supabase trigger: BEFORE UPDATE on posts ALWAYS stamps updated_at = now().
-- The render-time views increment (src/app/posts/[slug]/page.tsx) is an UPDATE
-- on posts, so every page visit silently advanced updated_at, corrupting
-- dateModified (JSON-LD) and lastmod (sitemap) into "last view" timestamps.
--
-- Fix: gate the trigger with a WHEN clause so updated_at is stamped only when
-- content columns actually change. A views-only UPDATE (views += 1) no longer
-- touches updated_at. Idempotent: DROP + CREATE, safe to re-run.

DROP TRIGGER IF EXISTS posts_updated_at ON posts;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  WHEN (
    OLD.title IS DISTINCT FROM NEW.title
    OR OLD.slug IS DISTINCT FROM NEW.slug
    OR OLD.excerpt IS DISTINCT FROM NEW.excerpt
    OR OLD.content IS DISTINCT FROM NEW.content
    OR OLD.cover_image IS DISTINCT FROM NEW.cover_image
    OR OLD.author_id IS DISTINCT FROM NEW.author_id
    OR OLD.category_id IS DISTINCT FROM NEW.category_id
    OR OLD.status IS DISTINCT FROM NEW.status
    OR OLD.reading_time IS DISTINCT FROM NEW.reading_time
    OR OLD.published_at IS DISTINCT FROM NEW.published_at
  )
  EXECUTE FUNCTION update_updated_at();