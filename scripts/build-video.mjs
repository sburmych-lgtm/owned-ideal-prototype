/**
 * Builds the optimised salon video derivatives in site/media/video/.
 *
 * The masters are the salon's own footage; only two short segments are used,
 * both cut from the same continuous dolly shot so the two moving surfaces on
 * the page share one art direction.
 *
 *   A · hero-room   4:3  — hero inset, plays once then rests on its last frame
 *   B · space-neon  3:4  — space card 02, ping-pong loop, pausable
 *
 * Outputs are committed, so neither a build nor a deploy needs ffmpeg. Re-run
 * only when the footage or the crops change:
 *
 *   FFMPEG=/path/to/ffmpeg node scripts/build-video.mjs path/to/masters
 *
 * The masters directory must contain hero-desktop.mp4 (1920x1080).
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "..", "site", "media", "video");

const FFMPEG = process.env.FFMPEG || "ffmpeg";
const MASTERS = process.argv[2] || path.resolve(__dirname, "..", "..", "video-masters");
const SOURCE = path.join(MASTERS, "hero-desktop.mp4");

if (!fs.existsSync(SOURCE)) {
  console.error(`Master not found: ${SOURCE}\nPass the masters directory as the first argument.`);
  process.exit(1);
}

const FPS = 25;

const clips = [
  {
    id: "hero-room",
    // 4:3 window on the neon sign, centred; opens on the leaves and the sofa
    // and settles on the sign — a reveal, so it plays once and holds.
    crop: "crop=1440:1080:240:0",
    scale: "scale=720:540",
    start: 2.2,
    duration: 5.5,
    pingPong: false,
    vp9Crf: 44,
    h264Crf: 28,
  },
  {
    id: "space-neon",
    // 3:4 window on the same shot for the portrait card. Ping-ponged so the
    // loop has no visible seam.
    crop: "crop=810:1080:483:0",
    scale: "scale=720:960",
    start: 5.4,
    duration: 4.0,
    pingPong: true,
    vp9Crf: 46,
    h264Crf: 29,
  },
];

const run = (args) => execFileSync(FFMPEG, ["-hide_banner", "-v", "error", ...args], { stdio: "inherit" });

fs.mkdirSync(OUT, { recursive: true });

const report = [];

for (const clip of clips) {
  const base = path.join(OUT, clip.id);
  const chain = `${clip.crop},${clip.scale},fps=${FPS}`;

  // Poster is the clip's own first frame, so activation cannot shift the frame.
  run([
    "-ss", String(clip.start), "-i", SOURCE,
    "-vf", chain, "-frames:v", "1",
    "-c:v", "libwebp", "-quality", "82", "-compression_level", "6",
    "-y", `${base}-poster.webp`,
  ]);

  const filter = clip.pingPong
    ? `[0:v]${chain},split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0[v]`
    : null;

  const videoIn = ["-ss", String(clip.start), "-t", String(clip.duration), "-i", SOURCE, "-an"];
  const videoFilter = filter ? ["-filter_complex", filter, "-map", "[v]"] : ["-vf", chain];

  run([
    ...videoIn, ...videoFilter,
    "-c:v", "libvpx-vp9", "-crf", String(clip.vp9Crf), "-b:v", "0",
    "-row-mt", "1", "-deadline", "good", "-cpu-used", "1",
    "-pix_fmt", "yuv420p",
    "-y", `${base}.webm`,
  ]);

  run([
    ...videoIn, ...videoFilter,
    "-c:v", "libx264", "-crf", String(clip.h264Crf), "-preset", "slow",
    "-profile:v", "main", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    "-y", `${base}.mp4`,
  ]);

  const kb = (f) => Math.round(fs.statSync(f).size / 1024);
  report.push({
    id: clip.id,
    seconds: clip.pingPong ? clip.duration * 2 : clip.duration,
    webm: kb(`${base}.webm`),
    mp4: kb(`${base}.mp4`),
    poster: kb(`${base}-poster.webp`),
  });
}

console.table(report);
