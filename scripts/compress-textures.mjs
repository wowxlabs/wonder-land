#!/usr/bin/env node
// Converts PNG textures in public/models to WebP and updates GLTF references.
import { execSync } from "child_process";
import { readdirSync, readFileSync, writeFileSync, statSync, unlinkSync } from "fs";
import { join, dirname, extname, basename } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MODELS_DIR = join(ROOT, "public", "models");

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

const allFiles = walk(MODELS_DIR);
const pngs = allFiles.filter(f => extname(f).toLowerCase() === ".png");
const gltfs = allFiles.filter(f => extname(f).toLowerCase() === ".gltf");

console.log(`Found ${pngs.length} PNGs and ${gltfs.length} GLTF files`);

// Step 1: Convert each PNG → WebP
let converted = 0;
for (const png of pngs) {
  const webp = png.slice(0, -4) + ".webp";
  const name = basename(png);
  // Use higher quality for normal maps to preserve precision
  const quality = name.toLowerCase().includes("normal") ? 90 : 80;
  try {
    execSync(`cwebp -q ${quality} "${png}" -o "${webp}"`, { stdio: "pipe" });
    const origSize = statSync(png).size;
    const newSize = statSync(webp).size;
    console.log(`  ${name}: ${(origSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB`);
    converted++;
  } catch (e) {
    console.error(`  FAILED: ${name}`, e.message);
  }
}
console.log(`\nConverted ${converted}/${pngs.length} PNGs to WebP`);

// Step 2: Update GLTF files to reference .webp instead of .png
let updatedGltfs = 0;
for (const gltf of gltfs) {
  const original = readFileSync(gltf, "utf8");
  const updated = original.replace(/\.png/g, ".webp");
  if (updated !== original) {
    writeFileSync(gltf, updated, "utf8");
    updatedGltfs++;
  }
}
console.log(`Updated ${updatedGltfs} GLTF files\n`);

// Step 3: Remove old PNGs
let removed = 0;
for (const png of pngs) {
  const webp = png.slice(0, -4) + ".webp";
  try {
    statSync(webp); // confirm webp exists
    unlinkSync(png);
    removed++;
  } catch {
    console.warn(`  Skipping removal of ${basename(png)} (no webp counterpart)`);
  }
}
console.log(`Removed ${removed} original PNG files`);
console.log("Done!");
