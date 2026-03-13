# Google Service Account Setup for Search Console + Indexing API

## Prerequisites

- `gcloud` CLI installed and authenticated
- `gh` CLI installed and authenticated
- A Google Cloud project
- Site verified in Google Search Console

## Step-by-Step CLI Commands

Replace `PROJECT_ID` with the Google Cloud project ID and `OWNER/REPO` with the GitHub repository.

### 1. Enable the Indexing API

```bash
gcloud services enable indexing.googleapis.com --project=PROJECT_ID
```

### 2. Create a Service Account

```bash
gcloud iam service-accounts create sitemap-pinger \
  --display-name="Sitemap Pinger" \
  --project=PROJECT_ID
```

### 3. Download the JSON Key

```bash
gcloud iam service-accounts keys create /tmp/sitemap-pinger-sa.json \
  --iam-account=sitemap-pinger@PROJECT_ID.iam.gserviceaccount.com
```

### 4. Add as GitHub Secret

```bash
gh secret set GOOGLE_SA_JSON < /tmp/sitemap-pinger-sa.json --repo=OWNER/REPO
```

### 5. Clean Up Local Key

```bash
rm /tmp/sitemap-pinger-sa.json
```

### 6. Add to Search Console (Manual Step)

This cannot be done via CLI. Go to:

1. https://search.google.com/search-console
2. Select the property
3. Settings > Users and permissions > Add user
4. Enter: `sitemap-pinger@PROJECT_ID.iam.gserviceaccount.com`
5. Set permission: **Owner**

## Verifying Setup

After the next production deploy, check the GitHub Action logs:

```bash
gh run list --workflow="Ping Search Engines with Sitemap" --limit=1
gh run view <RUN_ID> --log
```

Look for:
- `Search Console submit: HTTP 204` — success
- `Indexing API notify: HTTP 200` — success

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| HTTP 403 on Search Console | Service account not added as owner | Add email to Search Console users |
| HTTP 403 on Indexing API | API not enabled | Run `gcloud services enable indexing.googleapis.com` |
| HTTP 401 | Invalid or expired credentials | Re-create the key and update the secret |
| Secret not found | Secret name mismatch | Verify `GOOGLE_SA_JSON` matches in workflow and GitHub |
