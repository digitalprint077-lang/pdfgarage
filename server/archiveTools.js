import archiver from "archiver";
import { createWriteStream } from "fs";
import fs from "fs/promises";
import path from "path";
import { pipeline } from "stream/promises";
import { createReadStream } from "fs";

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

export async function extractZip(buffer, tmpDir) {
  const { default: unzipper } = await import("unzipper");
  const extractDir = path.join(tmpDir, "extracted");
  await fs.mkdir(extractDir, { recursive: true });

  const zipPath = path.join(tmpDir, "input.zip");
  await fs.writeFile(zipPath, buffer);

  await pipeline(createReadStream(zipPath), unzipper.Extract({ path: extractDir }));

  const outZip = path.join(tmpDir, "extracted.zip");
  await zipDirectory(extractDir, outZip);
  const outBuffer = await fs.readFile(outZip);
  return { buffer: outBuffer, filename: "extracted.zip", mimeType: "application/zip" };
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

export function isArchiveFormat(fmt) {
  return new Set(["zip", "tar", "gz", "7z", "rar"]).has(fmt);
}
