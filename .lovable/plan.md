
## What you'll get

A new admin section at **`/admin/seo`** on precisedm.com that mirrors the Atman99 SEO dashboard 1:1:

- **30-day execution plan** — every SEO / AEO / GEO task scheduled day-by-day, with target page, primary keyword, meta description, content brief, status (Not started / In progress / Completed / Blocked), and per-task completion notes.
- **Calendar view** — tasks grouped by day with "Today", "Overdue", "Done" badges.
- **All-tasks table** — sortable list with filters by channel (SEO/AEO/GEO), status, and month.
- **Keyword map** — every keyword we're targeting and where it's used (which task / which blog).
- **Blogs board** — draft → in-review → approved → deployed workflow, with client-approval toggle.
- **Analytics tab** — live GA4 (users, sessions, bounce, engagement) + Google Search Console (clicks, impressions, CTR, avg position, top queries, top pages, country, device split) with date-range comparisons (today vs yesterday, last 7d vs prior 7, last 28d vs prior 28, last 90d).
- **Keyword rankings** — live positions from Search Console for every keyword in the plan, with "Top 3 / Page 1 / Page 2 / Not ranking" buckets.
- **Indexing tab** — Google Indexing API log + manual "Ping URL" button + Bing/GSC inspect links.
- **Automation controls** — toggle auto-execute of due tasks; toggle blog client-approval required.
- **Download plan as PDF** — full 30-day execution plan, ready to send.

Same look & feel, same KPIs, same workflow as Atman99. Re-skinned for PreciseDM (brand strings, domain, plan content tailored to a healthcare SaaS).

## What will NOT change

- Existing site (precisedm.com) — landing, features, blogs, tools, auth — **untouched**.
- Existing `/admin` page (admin dashboard for users/subscriptions) — **untouched**.
- Existing `ga4-report` / `gsc-report` edge functions — **untouched**.
- New dashboard lives at a brand-new route `/admin/seo`, guarded by your admin role. Nothing else is wired into it.

---

## Technical plan

### 1. Database (new tables only, no edits to existing ones)
Migration adds:
- `seo_tasks` — the 30-day execution plan
- `seo_blog_posts` — blog drafts + approval workflow
- `seo_settings` — automation toggles
- `seo_integrations` — Google OAuth refresh token storage (encrypted)
- `seo_indexing_log` — Google Indexing API ping history
- `seo_keyword_cache` — GSC keyword cache for snappy dashboard
- `seo_page_overrides` — per-route SEO overrides

All tables admin-only via RLS (`has_role(auth.uid(), 'admin')`).

### 2. Edge functions (new, no edits)
- `seo-google-oauth-start` — kicks off Google OAuth
- `seo-google-oauth-callback` — stores refresh token
- `seo-google-analytics-fetch` — pulls GA4 + GSC live data
- `seo-keywords-status` — pulls per-keyword positions from GSC
- `seo-indexing-ping` — Google Indexing API
- `seo-auto-execute` — daily executor that applies due tasks
- `seo-verify-live` — verifies a deployed change is live on the site

Requires `GOOGLE_OAUTH_CLIENT_ID` + `GOOGLE_OAUTH_CLIENT_SECRET` secrets. I'll request these once we kick off implementation.

### 3. Frontend (new files only)
- `src/pages/admin/seo/AdminSeo.tsx` (main dashboard)
- `src/pages/admin/seo/AdminSeoAnalytics.tsx`
- `src/pages/admin/seo/AdminSeoIndexing.tsx`
- `src/pages/admin/seo/AdminSeoKeywords.tsx`
- `src/lib/seoPlanPdf.ts` (PDF export)
- New route `/admin/seo` added to `App.tsx`, gated by admin role.

### 4. Content seeding
Seed `seo_tasks` and `seo_blog_posts` with a 30-day plan tailored to PreciseDM (insulin dosing tools, clinician audience, India + US markets). You can edit/extend any task inline in the dashboard.

---

## What I need from you (one-time)

1. **Google OAuth client** — I'll guide you through creating it in Google Cloud Console (5 min) and you'll paste the client ID/secret once.
2. **Confirm domain** — should rankings/analytics target `https://www.precisedm.com/` (Search Console property)? Yes/No.
3. **Confirm seeding** — should I seed a fresh 30-day plan for PreciseDM, or leave the tables empty for you to fill in?

Reply **"go"** and I'll start with the migration + edge functions, then the UI, then ask for the OAuth credentials when ready to wire up live data.
