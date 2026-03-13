/**
 * Example sitemap.ts for a Next.js site with blog posts.
 * Blog entries are dynamically generated from getAllPosts().
 * Static pages are listed explicitly.
 */

import type { MetadataRoute } from "next";
// import { getAllPosts } from "@/lib/blog";
// import { SITE_URL } from "@/lib/constants";

const SITE_URL = "https://example.com";

// Stub for example purposes
function getAllPosts() {
  return [
    { slug: "first-post", date: "2026-01-15" },
    { slug: "second-post", date: "2026-02-01" },
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  const blogEntries = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
  }));

  return [
    // Static pages — keep in sync with src/app/**/page.tsx
    {
      url: SITE_URL,
      lastModified: new Date("2026-03-08"),
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date("2026-03-08"),
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: new Date("2026-03-01"),
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date("2026-02-01"),
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date("2026-01-15"),
    },
    // Dynamic blog entries
    ...blogEntries,
  ];
}
