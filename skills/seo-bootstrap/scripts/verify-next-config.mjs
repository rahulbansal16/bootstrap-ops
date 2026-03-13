#!/usr/bin/env node
/**
 * Verify that next.config.ts does not contain settings
 * that break Vercel deployments (e.g. standalone output
 * disabling Vercel's native image optimization).
 *
 * Exits with code 1 if any problematic config is detected.
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const ROOT_DIR = resolve(new URL(".", import.meta.url).pathname, "..");

// Detect next.config file (supports .ts, .mjs, .js)
const CONFIG_NAMES = ["next.config.ts", "next.config.mjs", "next.config.js"];
const CONFIG_PATH = CONFIG_NAMES.map((n) => resolve(ROOT_DIR, n)).find(existsSync);

if (!CONFIG_PATH) {
  console.error("ERROR: No next.config file found.");
  process.exit(1);
}

function main() {
  console.log(`Verifying ${CONFIG_PATH}...\n`);

  const source = readFileSync(CONFIG_PATH, "utf-8");
  const errors = [];

  // output: "standalone" breaks Vercel image optimization
  if (/output\s*:\s*["']standalone["']/.test(source)) {
    errors.push(
      'output: "standalone" is set. This disables Vercel\'s native image optimization and will cause /_next/image requests to fail. Remove it for Vercel deployments.'
    );
  }

  // images.unoptimized bypasses all optimization
  if (/unoptimized\s*:\s*true/.test(source)) {
    errors.push(
      "images.unoptimized is true. Images will not be optimized, hurting performance."
    );
  }

  if (errors.length > 0) {
    console.error(`ERROR: Found ${errors.length} issue(s):\n`);
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  console.log("Next.js config check PASSED.");
}

main();
