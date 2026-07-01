import archiver from "archiver";
import { createWriteStream } from "fs";
import fs from "fs/promises";
import path from "path";

export async function createZipArchive(files, tmpDir, baseName) {
  const zipPath = path.join(tmpDir, `${baseName}.zip`);

  await new Promise((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);
    files.forEach((f, i) => {
      archive.append(f.buffer, { name: f.originalName || `file-${i + 1}` });
    });
    archive.finalize();
  });

  const buffer = await fs.readFile(zipPath);
  return { buffer, filename: `${baseName}.zip`, mimeType: "application/zip" };
}

export async function extractZipToDir(buffer, tmpDir) {
  const { default: unzipper } = await import("unzipper");
  await fs.mkdir(tmpDir, { recursive: true });
  const directory = await unzipper.Open.buffer(buffer);
  await directory.extract({ path: tmpDir });
  const entries = await fs.readdir(tmpDir);
  if (entries.length === 0) {
    throw new Error("Archive is empty or could not be extracted");
  }
  return tmpDir;
}

export async function extractZip(buffer, tmpDir) {
  const extractDir = path.join(tmpDir, "extracted");
  await extractZipToDir(buffer, extractDir);

  const outZip = path.join(tmpDir, "extracted.zip");
  await zipDirectory(extractDir, outZip);
  const outBuffer = await fs.readFile(outZip);
  return { buffer: outBuffer, filename: "extracted.zip", mimeType: "application/zip" };
}

const ARCHIVE_MIME = {
  zip: "application/zip",
  tar: "application/x-tar",
  "tar.gz": "application/gzip",
  tgz: "application/gzip",
  gz: "application/gzip",
};

export async function convertArchiveFormat(buffer, baseName, fromFmt, toFmt, tmpDir) {
  const from = String(fromFmt || "").toLowerCase();
  const to = String(toFmt || "").toLowerCase();
  const workDir = path.join(tmpDir, "archive-work");
  await fs.mkdir(workDir, { recursive: true });

  if (from === "zip") {
    await extractZipToDir(buffer, workDir);
  } else if (from === to) {
    return {
      buffer,
      filename: `${baseName}.${from}`,
      mimeType: ARCHIVE_MIME[from] || "application/octet-stream",
    };
  } else {
    throw new Error(
      `Archive conversion from ${from.toUpperCase()} requires 7-Zip or similar tools. Upload a ZIP or use Extract Archive.`
    );
  }

  if (to === "zip" || from === to) {
    const outPath = path.join(tmpDir, `${baseName}.zip`);
    await zipDirectory(workDir, outPath);
    const outBuffer = await fs.readFile(outPath);
    return { buffer: outBuffer, filename: `${baseName}.zip`, mimeType: ARCHIVE_MIME.zip };
  }

  const tarGz = to === "tar.gz" || to === "tgz" || to === "gz";
  const tarOnly = to === "tar";
  if (tarOnly || tarGz) {
    const ext = tarGz ? (to === "gz" ? "gz" : "tar.gz") : "tar";
    const outPath = path.join(tmpDir, `${baseName}.${ext}`);
    await tarDirectory(workDir, outPath, { gzip: tarGz });
    const outBuffer = await fs.readFile(outPath);
    return {
      buffer: outBuffer,
      filename: `${baseName}.${ext}`,
      mimeType: ARCHIVE_MIME[ext] || "application/octet-stream",
    };
  }

  throw new Error(
    `Archive conversion to ${to.toUpperCase()} is not supported yet. Try ZIP, TAR, or TAR.GZ.`
  );
}

async function tarDirectory(dir, outPath, { gzip = false } = {}) {
  await new Promise((resolve, reject) => {
    const output = createWriteStream(outPath);
    const format = gzip ? "tar" : "tar";
    const archive = archiver(format, { gzip, gzipOptions: { level: 9 } });
    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(dir, false);
    archive.finalize();
  });
}

async function zipDirectory(dir, outPath) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  await new Promise((resolve, reject) => {
    const output = createWriteStream(outPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) archive.directory(full, entry.name);
      else archive.file(full, { name: entry.name });
    }
    archive.finalize();
  });
}

const ARCHIVE_FORMATS = new Set([
  "7z", "ace", "alz", "arc", "arj", "bz", "bz2", "cab", "cpio", "deb", "dmg", "eml", "gz", "img",
  "iso", "jar", "lha", "lz", "lzma", "lzo", "rar", "rpm", "rz", "tar", "tar.7z", "tar.bz", "tar.bz2",
  "tar.gz", "tar.lzo", "tar.xz", "tar.z", "tbz", "tbz2", "tgz", "tz", "tzo", "xz", "z", "zip",
]);

export function isArchiveFormat(fmt) {
  return ARCHIVE_FORMATS.has(String(fmt || "").toLowerCase());
}
