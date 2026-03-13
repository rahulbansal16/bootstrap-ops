/**
 * Example sitemap.ts for a Next.js site without a blog.
 * All pages are listed statically.
 */

import type { MetadataRoute } from "next";

const SITE_URL = "https://example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
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
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: new Date("2025-12-01"),
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date("2025-12-01"),
    },
  ];
}
