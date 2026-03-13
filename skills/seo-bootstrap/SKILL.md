---
name: seo-bootstrap
description: This skill should be used when the user asks to "set up SEO", "add sitemap checks", "add search engine pinging", "bootstrap SEO", "SEO automation", "IndexNow setup", "sitemap verification", or wants to add build-time SEO validation and post-deploy search engine notification to a Next.js project deployed on Vercel. Covers sitemap coverage checks, Next.js config validation, GitHub Actions for pinging Google/Bing/Yandex/IndexNow, and Search Console API integration.
version: 1.0.0
license: MIT
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Agent
---

# SEO Bootstrap for Next.js + Vercel

Automate SEO hygiene for Next.js projects deployed on Vercel. Install build-time validation scripts and post-deploy GitHub Actions that ping every major search engine with the sitemap.

## What Gets Installed

### Build-Time Checks (run before/after `next build`)

1. **verify-next-config** — Fail the build if `next.config.ts` contains settings that break Vercel image optimization (e.g. `output: "standalone"`, `images.unoptimized: true`).

2. **verify-sitemap** — Fail the build if any `src/app/**/page.tsx` route is missing from `sitemap.ts`. Dynamically verifies blog posts are included via `getAllPosts()`. Supports an exclusion list for internal pages (thank-you pages, redirect pages, etc.).

### Post-Deploy Search Engine Pinging (GitHub Action)

A `ping-sitemap.yml` workflow triggers on every successful Vercel production deploy and notifies:

| Engine | Method | Auth Required |
|--------|--------|---------------|
| Google | Ping URL | None |
| Google | Search Console API | `GOOGLE_SA_JSON` secret |
| Google | Indexing API | `GOOGLE_SA_JSON` secret |
| Bing | Ping URL | None |
| Bing | IndexNow | `INDEXNOW_KEY` secret |
| Yandex | Ping URL | None |
| Yandex | IndexNow | `INDEXNOW_KEY` secret |
| Seznam | IndexNow | `INDEXNOW_KEY` secret |
| Naver | IndexNow | `INDEXNOW_KEY` secret |

## Installation Steps

### Step 1: Detect Project Structure

Before installing, detect the project layout:

- Confirm this is a Next.js project (check for `next.config.ts` or `next.config.mjs` or `next.config.js`)
- Confirm deployment target is Vercel (check for `vercel.json` or `@vercel/*` in dependencies)
- Locate the app directory (`src/app/` or `app/`)
- Locate the sitemap file (`src/app/sitemap.ts` or `app/sitemap.ts`)
- Locate the blog content directory if any (`src/content/blog/` or similar)
- Check if `scripts/` directory exists

If the project is not Next.js + Vercel, warn the user and adapt the scripts accordingly. The ping workflow works for any framework; only the build checks are Next.js specific.

### Step 2: Install Build Scripts

Create `scripts/verify-next-config.mjs` using the template in `scripts/verify-next-config.mjs`.

Create `scripts/verify-sitemap.mjs` using the template in `scripts/verify-sitemap.mjs`. Adapt the following:

- **APP_DIR**: Set to the detected app directory path
- **SITEMAP_PATH**: Set to the detected sitemap file path
- **BLOG_DIR**: Set to the detected blog content directory, or remove blog checks if no blog exists
- **EXCLUDED_ROUTES**: Ask the user which routes should be excluded from sitemap checking (e.g. thank-you pages, internal tools, redirect pages)
- **SITE_URL detection**: Match the constant import pattern used in the project's sitemap file

### Step 3: Update Build Script

Modify `package.json` scripts.build to run the verification scripts:

```
"build": "node scripts/verify-next-config.mjs && node scripts/verify-sitemap.mjs && next build"
```

If there are existing post-build steps, preserve them. Always run verify scripts before `next build` so builds fail fast.

### Step 4: Install GitHub Action

Create `.github/workflows/ping-sitemap.yml` using the template in `scripts/ping-sitemap.yml`.

Replace `SITE_URL` and `SITEMAP_URL` with the project's actual production URL. Detect this from:
- `vercel.json` domains config
- Constants file in the codebase
- Ask the user if not detectable

### Step 5: Set Up IndexNow

1. Generate a random IndexNow key: `openssl rand -hex 16`
2. Create `public/<key>.txt` containing just the key
3. Instruct the user to add the key as `INDEXNOW_KEY` GitHub secret:
   ```
   echo "<key>" | gh secret set INDEXNOW_KEY --repo=<owner>/<repo>
   ```

Do NOT add the key directly — let the user run the `gh secret set` command themselves or guide them through it.

### Step 6: Google Service Account Setup (Optional)

Guide the user through setting up Google Search Console + Indexing API:

1. Enable the **Web Search Indexing API** in Google Cloud Console
2. Create a service account (or use existing)
3. Download the JSON key
4. Add the service account email as **Owner** in Google Search Console
5. Add the JSON as `GOOGLE_SA_JSON` GitHub secret

Provide the gcloud CLI commands but do NOT execute them without user approval:

```bash
gcloud services enable indexing.googleapis.com --project=PROJECT_ID
gcloud iam service-accounts create sitemap-pinger --display-name="Sitemap Pinger" --project=PROJECT_ID
gcloud iam service-accounts keys create /tmp/sa.json --iam-account=sitemap-pinger@PROJECT_ID.iam.gserviceaccount.com
gh secret set GOOGLE_SA_JSON < /tmp/sa.json --repo=OWNER/REPO
rm /tmp/sa.json
```

Always remind: manually add the service account to Search Console as Owner.

### Step 7: Verify Installation

Run the build scripts to confirm they pass:

```bash
node scripts/verify-next-config.mjs
node scripts/verify-sitemap.mjs
```

If either fails, fix the issues (add missing sitemap entries, remove problematic config) before committing.

### Step 8: Commit and Push

Stage all new and modified files:
- `scripts/verify-next-config.mjs`
- `scripts/verify-sitemap.mjs`
- `.github/workflows/ping-sitemap.yml`
- `public/<indexnow-key>.txt`
- `package.json`
- Any sitemap fixes

Commit with a descriptive message and push. The workflow will activate on the next production deploy.

## Adapting for Non-Blog Sites

If the project has no blog:
- Skip the blog slug verification in verify-sitemap.mjs
- Remove the `hasBlogEntries` check
- Focus only on static route coverage

## Adapting for Non-Vercel Deployments

If not deployed on Vercel:
- The `deployment_status` trigger may not fire — switch to `push` on `main` with a delay or use a webhook
- Skip `verify-next-config.mjs` standalone check (only relevant for Vercel image optimization)
- The ping URLs and IndexNow work universally regardless of hosting

## Important Notes

- Never commit secrets (API keys, service account JSON) to the repository
- The IndexNow key file in `public/` is intentionally public — it's a verification file, not a secret
- The Google ping URL (`google.com/ping?sitemap=...`) requires no authentication
- IndexNow pings propagate to all participating engines (Bing, Yandex, Seznam, Naver) from a single request
- Build checks run pre-build to fail fast and avoid wasting build minutes
