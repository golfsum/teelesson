import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const assets = path.join(root, "assets");
const source = await fs.readFile(path.join(assets, "brand-mark.svg"));

await sharp(source).resize(1024, 1024).png().toFile(path.join(assets, "icon.png"));
await sharp(source).resize(1024, 1024).png().toFile(path.join(assets, "adaptive-icon.png"));
await sharp(source).resize(48, 48).png().toFile(path.join(assets, "favicon.png"));
await sharp(source).resize(192, 192).png().toFile(path.join(root, "public", "icon-192.png"));
await sharp(source).resize(512, 512).png().toFile(path.join(root, "public", "icon-512.png"));
await sharp(await fs.readFile(path.join(assets, "social-card.svg")))
  .png()
  .toFile(path.join(root, "public", "social-card.png"));

const splashMark = await sharp(source).resize(420, 420).png().toBuffer();
await sharp({ create: { width: 1284, height: 2778, channels: 4, background: "#07171d" } })
  .composite([{ input: splashMark, left: 432, top: 1179 }])
  .png()
  .toFile(path.join(assets, "splash.png"));

console.log("Generated TeeLesson app, web, and social preview assets.");
