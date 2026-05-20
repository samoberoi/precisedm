
-- =========================================================
-- SEO / AEO / GEO admin dashboard — schema (PreciseDM)
-- All tables admin-only. Fully isolated from existing app.
-- =========================================================

-- Ensure pg_net for async http (used by indexing trigger)
create extension if not exists pg_net with schema extensions;

-- 1. seo_integrations -------------------------------------
CREATE TABLE public.seo_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL UNIQUE DEFAULT 'google',
  property_url TEXT,
  refresh_token TEXT,
  access_token TEXT,
  access_token_expires_at TIMESTAMPTZ,
  connected_by_user_id UUID,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_refreshed_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.seo_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seo_integrations_admin_all" ON public.seo_integrations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_seo_integrations_updated_at
  BEFORE UPDATE ON public.seo_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_subscription_updated_at();

-- 2. seo_keyword_cache ------------------------------------
CREATE TABLE public.seo_keyword_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_url TEXT NOT NULL,
  range_start DATE NOT NULL,
  range_end DATE NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.seo_keyword_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seo_keyword_cache_admin_all" ON public.seo_keyword_cache
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. seo_tasks --------------------------------------------
CREATE TABLE public.seo_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week int NOT NULL DEFAULT 1,
  day_start int,
  day_end int,
  scheduled_date date,
  section text NOT NULL DEFAULT 'SEO',
  category text NOT NULL DEFAULT 'on-page',
  deliverable_type text,
  priority text NOT NULL DEFAULT 'medium',
  effort_minutes int NOT NULL DEFAULT 30,
  title text NOT NULL,
  description text,
  target_url text,
  target_keyword text,
  secondary_keywords text[] NOT NULL DEFAULT '{}',
  page_title text,
  meta_description text,
  content_brief text,
  status text NOT NULL DEFAULT 'todo',
  completed_at timestamptz,
  completed_by uuid,
  notes text,
  blog_slug text,
  sort_order int NOT NULL DEFAULT 0,
  verified_at timestamptz,
  verified_status text,
  verified_snapshot jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.seo_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY seo_tasks_admin_all ON public.seo_tasks
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER seo_tasks_updated_at
  BEFORE UPDATE ON public.seo_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_subscription_updated_at();
CREATE INDEX seo_tasks_scheduled_date_idx ON public.seo_tasks(scheduled_date);

-- 4. seo_blog_posts ---------------------------------------
CREATE TABLE public.seo_blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  url text not null,
  title text not null,
  meta_description text,
  primary_keyword text,
  secondary_keywords text[] not null default '{}',
  body_md text not null,
  scheduled_date date,
  status text not null default 'draft',
  approved_at timestamptz,
  approved_by uuid,
  deployed_at timestamptz,
  client_notes text,
  internal_notes text,
  read_minutes int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
ALTER TABLE public.seo_blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY seo_blog_posts_admin_all ON public.seo_blog_posts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_seo_blog_posts_updated
  BEFORE UPDATE ON public.seo_blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_subscription_updated_at();

-- 5. seo_settings -----------------------------------------
CREATE TABLE public.seo_settings (
  id INT PRIMARY KEY DEFAULT 1,
  blog_approval_required BOOLEAN NOT NULL DEFAULT true,
  auto_execute BOOLEAN NOT NULL DEFAULT true,
  last_auto_run_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT singleton CHECK (id = 1)
);
INSERT INTO public.seo_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read seo_settings" ON public.seo_settings
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update seo_settings" ON public.seo_settings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 6. seo_page_overrides -----------------------------------
CREATE TABLE public.seo_page_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_path text NOT NULL UNIQUE,
  title text,
  meta_description text,
  h1 text,
  intro_copy text,
  target_keyword text,
  secondary_keywords text[] NOT NULL DEFAULT '{}'::text[],
  source_task_id uuid,
  applied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.seo_page_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY seo_page_overrides_public_read ON public.seo_page_overrides
  FOR SELECT TO public USING (true);
CREATE POLICY seo_page_overrides_admin_all ON public.seo_page_overrides
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_seo_page_overrides_updated
  BEFORE UPDATE ON public.seo_page_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_subscription_updated_at();
CREATE INDEX seo_page_overrides_route_path_idx ON public.seo_page_overrides(route_path);

-- 7. seo_indexing_log -------------------------------------
CREATE TABLE public.seo_indexing_log (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  action text not null default 'URL_UPDATED',
  source text,
  status text not null default 'pending',
  http_status int,
  response jsonb,
  error text,
  pinged_at timestamptz not null default now()
);
CREATE INDEX seo_indexing_log_pinged_at_idx ON public.seo_indexing_log (pinged_at desc);
ALTER TABLE public.seo_indexing_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY seo_indexing_log_admin_all ON public.seo_indexing_log
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Helper: async http ping into the seo-indexing-ping edge function
CREATE OR REPLACE FUNCTION public.trigger_indexing_ping(_url text, _action text, _source text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  fn_url text;
  service_key text;
BEGIN
  BEGIN
    fn_url := current_setting('app.settings.supabase_url', true);
  EXCEPTION WHEN OTHERS THEN
    fn_url := null;
  END;
  IF fn_url IS NULL OR fn_url = '' THEN
    fn_url := 'https://fpgxdtwmhsgikklsybql.supabase.co';
  END IF;
  BEGIN
    service_key := current_setting('app.settings.service_role_key', true);
  EXCEPTION WHEN OTHERS THEN
    service_key := null;
  END;
  BEGIN
    PERFORM extensions.http_post(
      url := fn_url || '/functions/v1/seo-indexing-ping',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || coalesce(service_key, '')
      ),
      body := jsonb_build_object('url', _url, 'action', _action, 'source', _source)::text
    );
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END;
$$;

-- Auto-ping when a blog post is deployed
CREATE OR REPLACE FUNCTION public.tg_seo_blog_indexing_ping()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'deployed')
     OR (TG_OP = 'UPDATE' AND NEW.status = 'deployed' AND (OLD.status IS DISTINCT FROM 'deployed')) THEN
    PERFORM public.trigger_indexing_ping(
      'https://www.precisedm.com/blog/' || NEW.slug,
      'URL_UPDATED',
      'blog:' || NEW.slug
    );
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_seo_blog_indexing
  AFTER INSERT OR UPDATE ON public.seo_blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.tg_seo_blog_indexing_ping();
