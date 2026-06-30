/**
 * Round-trip test: convert sample to each format, then back to mp3/mp4.
 * Run: node server/testMediaConversions.js --deep
 */
import fs from "fs/promises";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { convertFile, findFfmpeg } from "./converter.js";
import { AUDIO_FORMATS, VIDEO_FORMATS, AUDIO_OUTPUT_SKIP, VIDEO_OUTPUT_SKIP } from "./mediaFormats.js";

const exec = promisify(execFile);
const DEEP = process.argv.includes("--deep");
const TMP = path.join(os.tmpdir(), "pdf-converter-media-test");
const SAMPLE_MP3 = path.join(TMP, "sample.mp3");
const SAMPLE_MP4 = path.join(TMP, "sample.mp4");

const PRIMARY_AUDIO = ["mp3", "wav", "flac", "aac", "ogg", "m4a", "opus", "wma"];
const PRIMARY_VIDEO = ["mp4", "webm", "avi", "mkv", "mov", "wmv", "flv", "mpg"];
const ALL_AUDIO = [...AUDIO_FORMATS];
const ALL_VIDEO = [...VIDEO_FORMATS];

async function ensureSamples(ffmpeg) {
  await fs.mkdir(TMP, { recursive: true });
  if (!(await exists(SAMPLE_MP3))) {
    await exec(ffmpeg, [
      "-y", "-f", "lavfi", "-i", "sine=frequency=440:duration=1",
      "-c:a", "libmp3lame", "-q:a", "2", SAMPLE_MP3,
    ], { timeout: 30000 });
  }
  if (!(await exists(SAMPLE_MP4))) {
    await exec(ffmpeg, [
      "-y", "-f", "lavfi", "-i", "testsrc=duration=1:size=160x120:rate=10",
      "-f", "lavfi", "-i", "sine=frequency=440:duration=1",
      "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", SAMPLE_MP4,
    ], { timeout: 30000 });
  }
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function testConvert(buffer, name, from, to, tmpDir) {
  try {
    const result = await convertFile({
      buffer,
      originalName: name,
      fromFormat: from,
      toFormat: to,
      tmpDir,
    });
    if (!result.buffer?.length) throw new Error("empty output");
    return { ok: true, bytes: result.buffer.length, filename: result.filename, buffer: result.buffer };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function main() {
  const ffmpeg = await findFfmpeg();
  if (!ffmpeg) {
    console.error("FAIL: FFmpeg not found");
    process.exit(1);
  }
  console.log("FFmpeg:", ffmpeg);
  await ensureSamples(ffmpeg);

  const mp3 = await fs.readFile(SAMPLE_MP3);
  const mp4 = await fs.readFile(SAMPLE_MP4);
  const tmpDir = path.join(TMP, "runs");
  await fs.mkdir(tmpDir, { recursive: true });

  const failures = [];
  const passes = [];

  for (const to of PRIMARY_AUDIO) {
    if (to === "mp3") continue;
    const r = await testConvert(mp3, "sample.mp3", "mp3", to, tmpDir);
    (r.ok ? passes : failures).push({ type: "audio", from: "mp3", to, ...r });
  }

  for (const to of PRIMARY_VIDEO) {
    if (to === "mp4") continue;
    const r = await testConvert(mp4, "sample.mp4", "mp4", to, tmpDir);
    (r.ok ? passes : failures).push({ type: "video", from: "mp4", to, ...r });
  }

  for (const to of ["mp3", "wav", "aac", "flac", "ogg"]) {
    const r = await testConvert(mp4, "sample.mp4", "mp4", to, tmpDir);
    (r.ok ? passes : failures).push({ type: "video→audio", from: "mp4", to, ...r });
  }

  if (DEEP) {
    console.log("\nDeep round-trip: mp3 → each audio format → mp3");
    for (const fmt of ALL_AUDIO) {
      if (fmt === "mp3" || AUDIO_OUTPUT_SKIP.has(fmt)) continue;
      const out = await testConvert(mp3, "sample.mp3", "mp3", fmt, tmpDir);
      if (!out.ok) {
        failures.push({ type: "deep-audio-out", from: "mp3", to: fmt, error: out.error });
        continue;
      }
      const back = await testConvert(out.buffer, `out.${fmt}`, fmt, "mp3", tmpDir);
      (back.ok ? passes : failures).push({
        type: "deep-audio",
        from: "mp3",
        to: fmt,
        ...(back.ok ? back : { error: back.error }),
      });
    }

    console.log("Deep round-trip: mp4 → each video format → mp4");
    for (const fmt of ALL_VIDEO) {
      if (fmt === "mp4" || VIDEO_OUTPUT_SKIP.has(fmt)) continue;
      const out = await testConvert(mp4, "sample.mp4", "mp4", fmt, tmpDir);
      if (!out.ok) {
        failures.push({ type: "deep-video-out", from: "mp4", to: fmt, error: out.error });
        continue;
      }
      const back = await testConvert(out.buffer, `out.${out.filename || fmt}`, fmt, "mp4", tmpDir);
      (back.ok ? passes : failures).push({
        type: "deep-video",
        from: "mp4",
        to: fmt,
        ...(back.ok ? back : { error: back.error }),
      });
    }
  }

  console.log(`\n=== RESULTS: ${passes.length} passed, ${failures.length} failed ===\n`);

  if (failures.length) {
    console.log("FAILURES:");
    for (const f of failures) {
      console.log(`  ${f.type} ${f.from} → ${f.to}: ${f.error}`);
    }
  }

  const critical = failures.filter((f) => !f.type.startsWith("deep") || DEEP);
  process.exit(critical.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
