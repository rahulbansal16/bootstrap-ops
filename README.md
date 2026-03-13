# bootstrap-ops

Automate the boring parts of running a company. SEO, deployments, monitoring, and operational skills for solo founders who'd rather build product.

## Skills

### seo-bootstrap

Build-time SEO validation and post-deploy search engine pinging for Next.js + Vercel projects.

**What it does:**
- Validates Next.js config won't break image optimization on Vercel
- Ensures every page route is covered in the sitemap
- Pings Google, Bing, Yandex after every production deploy
- Submits sitemap via Google Search Console + Indexing API
- Notifies Bing, Yandex, Seznam, Naver via IndexNow protocol

**Usage with Claude Code:**
```
/seo-bootstrap
```

Or ask Claude: "set up SEO automation for this project"

## Installation

Add this repo as a skill source in your Claude Code configuration, or copy individual skill directories into your project's `.claude/skills/` folder.
