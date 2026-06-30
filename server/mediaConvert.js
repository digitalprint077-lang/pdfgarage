import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { AUDIO_FORMATS, VIDEO_FORMATS, MEDIA_MIME } from "./mediaFormats.js";

const exec = promisify(execFile);

export async function findFfmpeg() {
  const candidates =
    process.platform === "win32" ? ["ffmpeg.exe", "ffmpeg"] : ["ffmpeg"];
  for (const cmd of candidates) {
    try {
      await exec(cmd, ["-version"], { timeout: 5000 });
      return cmd;
    } catch {
      /* try next */
    }
  }
  return null;
}

/** FFmpeg encode flags for audio-only output. */
function audioEncodeArgs(fmt) {
  switch (fmt) {
    case "mp3":
      return ["-vn", "-c:a", "libmp3lame", "-q:a", "2"];
    case "wav":
      return ["-vn", "-c:a", "pcm_s16le"];
    case "flac":
      return ["-vn", "-c:a", "flac"];
    case "aac":
      return ["-vn", "-c:a", "aac", "-b:a", "192k"];
    case "m4a":
      return ["-vn", "-c:a", "aac", "-b:a", "192k"];
    case "ogg":
      return ["-vn", "-c:a", "libvorbis", "-q:a", "4"];
    case "opus":
      return ["-vn", "-c:a", "libopus", "-b:a", "128k"];
    case "wma":
      return ["-vn", "-c:a", "wmav2", "-b:a", "128k"];
    case "aiff":
    case "aif":
      return ["-vn", "-c:a", "pcm_s16be", "-f", "aiff"];
    case "amr":
      return ["-vn", "-c:a", "libopencore_amrnb", "-ar", "8000", "-ac", "1"];
    case "ac3":
      return ["-vn", "-c:a", "ac3", "-b:a", "192k"];
    case "au":
      return ["-vn", "-c:a", "pcm_s16be", "-f", "au"];
    case "caf":
      return ["-vn", "-c:a", "pcm_s16le", "-f", "caf"];
    case "mka":
      return ["-vn", "-c:a", "flac"];
    case "wv":
      return ["-vn", "-c:a", "wavpack"];
    case "ape":
      throw new Error("APE output is not supported. Try FLAC or WV for lossless audio.");
    case "dts":
      return ["-vn", "-c:a", "dca", "-strict", "-2"];
    case "voc":
      return ["-vn", "-c:a", "pcm_s16le"];
    case "mid":
    case "midi":
      throw new Error("MIDI export is not supported from audio/video files.");
    default:
      return ["-vn", "-c:a", "aac", "-b:a", "192k"];
  }
}

/** FFmpeg encode flags for video (+ audio) output. */
function videoEncodeArgs(fmt) {
  const baseAudio = ["-c:a", "aac", "-b:a", "128k"];
  switch (fmt) {
    case "mp4":
    case "m4v":
    case "mov":
      return ["-c:v", "libx264", "-preset", "fast", "-crf", "23", ...baseAudio, "-movflags", "+faststart"];
    case "webm":
      return ["-c:v", "libvpx-vp9", "-crf", "32", "-b:v", "0", "-c:a", "libopus", "-b:a", "128k"];
    case "avi":
      return ["-c:v", "mpeg4", "-q:v", "5", "-c:a", "libmp3lame", "-q:a", "4"];
    case "mkv":
      return ["-c:v", "libx264", "-crf", "23", "-c:a", "aac", "-b:a", "128k"];
    case "wmv":
    case "asf":
      return ["-c:v", "wmv2", "-c:a", "wmav2", "-b:a", "128k"];
    case "flv":
    case "f4v":
      return ["-c:v", "libx264", "-c:a", "aac", "-b:a", "128k"];
    case "mpg":
    case "mpeg":
    case "m2v":
      return ["-c:v", "mpeg2video", "-c:a", "mp2", "-b:a", "192k"];
    case "3gp":
      return ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "96k", "-s", "320x240", "-f", "3gp"];
    case "3g2":
      return ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "96k", "-s", "320x240", "-f", "3g2"];
    case "ogv":
      return ["-c:v", "libtheora", "-q:v", "7", "-c:a", "libvorbis", "-q:a", "4"];
    case "ts":
    case "mts":
    case "m2ts":
      return ["-c:v", "libx264", "-crf", "23", "-c:a", "aac", "-b:a", "128k", "-f", "mpegts"];
    case "vob":
      return ["-c:v", "mpeg2video", "-c:a", "ac3", "-b:a", "192k", "-f", "vob"];
    case "dv":
      return [
        "-vf", "scale=720:480",
        "-pix_fmt", "yuv411p",
        "-c:v", "dvvideo",
        "-r", "29.97",
        "-c:a", "pcm_s16le",
        "-ac", "2",
        "-ar", "48000",
      ];
    case "mxf":
      return [
        "-vf", "scale=1280:720",
        "-r", "25",
        "-c:v", "mpeg2video",
        "-pix_fmt", "yuv422p",
        "-c:a", "pcm_s16le",
        "-ar", "48000",
        "-ac", "2",
        "-f", "mxf",
        "-strict", "-2",
      ];
    case "nut":
      return ["-c:v", "libx264", "-crf", "23", "-c:a", "flac", "-f", "nut"];
    case "hevc":
      return ["-c:v", "libx265", "-crf", "28", ...baseAudio, "-tag:v", "hvc1"];
    case "ogm":
      return ["-c:v", "libtheora", "-q:v", "7", "-c:a", "libvorbis", "-q:a", "4", "-f", "ogg"];
    case "mod":
      return ["-c:v", "mpeg2video", "-c:a", "mp2", "-b:a", "192k", "-f", "mpeg"];
    case "rm":
    case "swf":
      throw new Error(`${fmt.toUpperCase()} output is not supported. Try MP4 or WEBM instead.`);
    default:
      return ["-c:v", "libx264", "-crf", "23", ...baseAudio];
  }
}

function outputEncodeArgs(toFormat) {
  if (AUDIO_FORMATS.has(toFormat)) return audioEncodeArgs(toFormat);
  if (VIDEO_FORMATS.has(toFormat)) return videoEncodeArgs(toFormat);
  return ["-c:a", "aac", "-b:a", "192k"];
}

function flattenEncodeArgs(encodeArgs) {
  if (encodeArgs instanceof Error) throw encodeArgs;
  return encodeArgs;
}

/** Some extensions need a different file suffix for FFmpeg muxers. */
export function resolveOutputPath(outputPath, toFormat) {
  return outputPath;
}

export function resolveOutputFilename(filename, _toFormat) {
  return filename;
}

export async function convertWithFfmpeg(inputPath, outputPath, options = {}) {
  const ffmpeg = await findFfmpeg();
  if (!ffmpeg) {
    throw new Error("FFmpeg is required for audio/video conversion. Install from https://ffmpeg.org/");
  }

  const toFormat = options.toFormat || path.extname(outputPath).slice(1).toLowerCase();
  const resolvedPath = resolveOutputPath(outputPath, toFormat);
  const encodeArgs = flattenEncodeArgs(outputEncodeArgs(toFormat));

  const args = ["-y", "-i", inputPath, ...encodeArgs];
  if (options.quality && encodeArgs.some((a) => a.includes("crf"))) {
    /* quality override handled per-codec if needed */
  }
  if (options.audioBitrate) args.push("-b:a", options.audioBitrate);
  args.push(resolvedPath);

  await exec(ffmpeg, args, { timeout: 300000, maxBuffer: 20 * 1024 * 1024 });
  return fs.readFile(resolvedPath);
}

export async function extractAudioFromVideo(inputPath, outputPath, toFormat) {
  const ffmpeg = await findFfmpeg();
  if (!ffmpeg) throw new Error("FFmpeg is required.");

  const fmt = toFormat || path.extname(outputPath).slice(1).toLowerCase();
  const resolvedPath = resolveOutputPath(outputPath, fmt);
  const args = ["-y", "-i", inputPath, ...flattenEncodeArgs(audioEncodeArgs(fmt)), resolvedPath];

  await exec(ffmpeg, args, { timeout: 300000, maxBuffer: 20 * 1024 * 1024 });
  return fs.readFile(resolvedPath);
}

export function isMediaFormat(fmt) {
  return AUDIO_FORMATS.has(fmt) || VIDEO_FORMATS.has(fmt);
}

export function isAudioOnly(fmt) {
  return AUDIO_FORMATS.has(fmt);
}

export function isVideoFormat(fmt) {
  return VIDEO_FORMATS.has(fmt);
}

export function getMediaMime(fmt) {
  return MEDIA_MIME[fmt] || "application/octet-stream";
}
