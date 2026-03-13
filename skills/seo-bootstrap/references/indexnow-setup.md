# IndexNow Setup

IndexNow is an open protocol that lets websites notify search engines about URL changes instantly. One submission reaches Bing, Yandex, Seznam, Naver, and any future participating engines.

## How It Works

1. Generate a unique key
2. Host a verification file at `https://yourdomain.com/<key>.txt`
3. Send POST requests to `https://api.indexnow.org/indexnow` with the key

## Setup Commands

### 1. Generate a Key

```bash
INDEXNOW_KEY=$(openssl rand -hex 16)
echo "Your IndexNow key: $INDEXNOW_KEY"
```

### 2. Create the Verification File

Place in the `public/` directory of the Next.js project:

```bash
echo "$INDEXNOW_KEY" > public/$INDEXNOW_KEY.txt
```

This file will be served at `https://yourdomain.com/<key>.txt` after deploy.

### 3. Add as GitHub Secret

```bash
echo "$INDEXNOW_KEY" | gh secret set INDEXNOW_KEY --repo=OWNER/REPO
```

### 4. Commit the Verification File

```bash
git add public/$INDEXNOW_KEY.txt
git commit -m "Add IndexNow verification file"
git push
```

## Verification

After deploy, confirm the key file is accessible:

```bash
curl -s https://yourdomain.com/<key>.txt
```

Should return the key string.

## Participating Search Engines

As of 2025, IndexNow is supported by:
- **Bing** (Microsoft)
- **Yandex** (Russia)
- **Seznam** (Czech Republic)
- **Naver** (South Korea)

Google has acknowledged IndexNow but has not officially joined. The workflow still pings Google separately via their own endpoints.

## API Format

Single URL notification:
```json
{
  "host": "yourdomain.com",
  "key": "<your-key>",
  "keyLocation": "https://yourdomain.com/<your-key>.txt",
  "urlList": ["https://yourdomain.com/sitemap.xml"]
}
```

Batch URL notification (up to 10,000 URLs):
```json
{
  "host": "yourdomain.com",
  "key": "<your-key>",
  "keyLocation": "https://yourdomain.com/<your-key>.txt",
  "urlList": [
    "https://yourdomain.com/page-1",
    "https://yourdomain.com/page-2"
  ]
}
```
