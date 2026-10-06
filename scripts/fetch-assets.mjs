// One-time helper: downloads the real photo assets exported from Figma into
// /public/images so the site doesn't depend on Figma's servers at runtime.
//
// Run this BEFORE the links expire (Figma serves these export links for a
// limited time, generally about a week from when they were generated).
// If a link has already expired, re-export the image from Figma (or take a
// screenshot of the layer) and drop it into public/images manually using the
// same filename — the components already point at these local paths.
//
// Usage:
//   npm run fetch-assets

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "images");

const ASSETS = {
  "logo.png":
    "https://www.figma.com/api/mcp/asset/71be7b3b-b684-4ee4-b000-be8036074dee.png",
  "hero-avatar.png":
    "https://www.figma.com/api/mcp/asset/3ee0ad8a-c1f3-484d-81b3-b5e49a2aedd9.png",
  "avatar-chat.png":
    "https://www.figma.com/api/mcp/asset/ac9229b1-99aa-45e5-902f-25ea1d957a5f.png",
  "about-img-1.png":
    "https://www.figma.com/api/mcp/asset/5768fcbd-c57b-466b-a6fb-9a72c2ce3085.png",
  "about-img-2.png":
    "https://www.figma.com/api/mcp/asset/c702d23c-400f-4f73-865e-33f9725d43ff.png",
  "about-img-3.png":
    "https://www.figma.com/api/mcp/asset/9ceff7fc-cdcf-4bfc-a150-3e8406309191.png",
  "about-img-4.png":
    "https://www.figma.com/api/mcp/asset/327618f7-2744-4459-93a1-3e3568a0f5fd/b1887.png",
  "testimonial-avatar-1.png":
    "https://www.figma.com/api/mcp/asset/1335a94b-8ccd-48d4-bdb9-8cd446c07b64/0b163.png",
  "testimonial-avatar-2.png":
    "https://www.figma.com/api/mcp/asset/1335a94b-8ccd-48d4-bdb9-8cd446c07b64/14ae0.png",
  "testimonial-avatar-3.png":
    "https://www.figma.com/api/mcp/asset/1335a94b-8ccd-48d4-bdb9-8cd446c07b64/bf9f1.png",
  "testimonial-avatar-4.png":
    "https://www.figma.com/api/mcp/asset/1335a94b-8ccd-48d4-bdb9-8cd446c07b64/dfe35.png",
  "faq-avatar-1.png":
    "https://www.figma.com/api/mcp/asset/cfae332b-34e7-4bca-ae75-93f200c454df/ee175.png",
  "faq-avatar-2.png":
    "https://www.figma.com/api/mcp/asset/cfae332b-34e7-4bca-ae75-93f200c454df/05aab.png",
  "faq-avatar-3.png":
    "https://www.figma.com/api/mcp/asset/cfae332b-34e7-4bca-ae75-93f200c454df/3741b.png",
  "cta-bg.png":
    "https://www.figma.com/api/mcp/asset/b87ec3a9-1448-4058-b295-a20ce6cb3a03/041b9.png",
  "process-card-bg.png":
    "https://www.figma.com/api/mcp/asset/b00d7bd0-e792-446c-8e2c-79abfae6e835/a77e9.png",
};

async function main() {
  await mkdir(outDir, { recursive: true });
  const entries = Object.entries(ASSETS);
  let ok = 0;
  let failed = [];

  for (const [filename, url] of entries) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(path.join(outDir, filename), buf);
      console.log(`✔ ${filename}`);
      ok++;
    } catch (err) {
      console.error(`✘ ${filename} — ${err.message}`);
      failed.push(filename);
    }
  }

  console.log(`\n${ok}/${entries.length} assets saved to public/images`);
  if (failed.length) {
    console.log(
      `\nThese failed (likely expired export links) — re-export from Figma and save under the same name in public/images:\n  ${failed.join(
        "\n  "
      )}`
    );
  }
}

main();
