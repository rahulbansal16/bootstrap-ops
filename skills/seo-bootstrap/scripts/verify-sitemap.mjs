#!/usr/bin/env node
/**
 * Verify that every page in the app directory is either present
 * in the sitemap or explicitly excluded.
 *
 * ADAPT BEFORE USE:
 * - APP_DIR: path to your Next.js app directory
 * - SITEMAP_PATH: path to your sitemap.ts file
 * - BLOG_DIR: path to blog content (or set to null if no blog)
 * - EXCLUDED_ROUTES: routes intentionally left out of the sitemap
 * - SITE_URL_PATTERN: regex to match URL construction in sitemap.ts
 *
 * Exits with code 1 if any page is unaccounted for.
 */

import { readdirSync, readFileSync, existsSync } from "fs";
import { resolve, basename } from "path";

const ROOT_DIR = resolve(new URL(".", import.meta.url).pathname, "..");

// --- CONFIGURE THESE FOR YOUR PROJECT ---
const APP_DIR = resolve(ROOT_DIR, "src/app");
const SITEMAP_PATH = resolve(APP_DIR, "sitemap.ts");
const BLOG_DIR = resolve(ROOT_DIR, "src/content/blog"); // set to null if no blog
// Pages intentionally excluded from the sitemap
const EXCLUDED_ROUTES = new Set([
  // "/thanks-for-purchasing",
  // "/internal-tool",
]);
// --- END CONFIGURATION ---

function findPageRoutes(dir, base = "") {
  const routes = [];
  if (!existsSync(dir)) return routes;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      // Skip dynamic segments like [slug] — handled separately
      if (entry.name.startsWith("[")) continue;
      routes.push(
        ...findPageRoutes(resolve(dir, entry.name), `${base}/${entry.name}`)
      );
    } else if (entry.name === "page.tsx" || entry.name === "page.ts") {
      routes.push(base || "/");
    }
  }
  return routes;
}

function getSitemapStaticRoutes() {
  const source = readFileSync(SITEMAP_PATH, "utf-8");
  const routes = new Set();

  // Match template literal URLs: `${SITE_URL}/pricing`
  const templateRegex = /url:\s*`\$\{[A-Z_]+\}([^`]*)`/g;
  let match;
  while ((match = templateRegex.exec(source)) !== null) {
    routes.add(match[1] || "/");
  }

  // Match bare constant URLs (root page): url: SITE_URL,
  if (/url:\s*[A-Z_]+\s*[,\n]/.test(source)) {
    routes.add("/");
  }

  // Check if blog entries are dynamically included
  const hasBlogEntries = /\.\.\.blog|getAllPosts|getPosts|getArticles/.test(
    source
  );

  return { routes, hasBlogEntries };
}

function getBlogSlugs() {
  if (!BLOG_DIR || !existsSync(BLOG_DIR)) return [];
  return readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => basename(f, f.endsWith(".mdx") ? ".mdx" : ".md"));
}

function main() {
  console.log("Verifying sitemap coverage...\n");

  if (!existsSync(SITEMAP_PATH)) {
    console.error(`ERROR: Sitemap not found at ${SITEMAP_PATH}`);
    process.exit(1);
  }

  const appRoutes = findPageRoutes(APP_DIR);
  const { routes: sitemapRoutes, hasBlogEntries } = getSitemapStaticRoutes();
  const blogSlugs = getBlogSlugs();

  const errors = [];

  // Check static pages
  for (const route of appRoutes) {
    if (route === "/blog") {
      if (!sitemapRoutes.has("/blog")) {
        errors.push("/blog is not in the sitemap");
      }
      continue;
    }
    if (EXCLUDED_ROUTES.has(route)) continue;
    if (sitemapRoutes.has(route)) continue;

    errors.push(
      `${route} has a page.tsx but is not in sitemap.ts. ` +
        `Add it to the sitemap or to EXCLUDED_ROUTES in verify-sitemap.mjs.`
    );
  }

  // Check blog posts are dynamically included
  if (blogSlugs.length > 0 && !hasBlogEntries) {
    errors.push(
      `${blogSlugs.length} blog posts exist but sitemap.ts does not ` +
        `dynamically include blog entries.`
    );
  }

  // Summary
  console.log(`App routes found:      ${appRoutes.length}`);
  console.log(`Sitemap static routes: ${sitemapRoutes.size}`);
  console.log(`Excluded routes:       ${EXCLUDED_ROUTES.size}`);
  console.log(`Blog posts:            ${blogSlugs.length}`);
  console.log(`Blog dynamic include:  ${hasBlogEntries ? "yes" : "NO"}\n`);

  if (errors.length > 0) {
    console.error(`ERROR: ${errors.length} sitemap issue(s):\n`);
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  console.log("Sitemap coverage check PASSED.");
}

main();
