import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(__dirname, "scripts", "pdf_to_docx.py");
const DOCX_TO_DOC_SCRIPT = path.join(__dirname, "scripts", "docx_to_doc.py");

let cachedPython = null;

async function commandExists(cmd, args = ["--version"]) {
  try {
    await execFileAsync(cmd, args, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

export async function resolvePythonCommand() {
  if (cachedPython) return cachedPython;

  if (process.platform === "win32" && (await commandExists("py", ["-3", "--version"]))) {
    cachedPython = { cmd: "py", args: ["-3"] };
    return cachedPython;
  }

  for (const cmd of ["python3", "python"]) {
    if (await commandExists(cmd)) {
      cachedPython = { cmd, args: [] };
      return cachedPython;
    }
  }

  return null;
}

export async function convertDocxToDoc(docxPath, docPath) {
  const python = await resolvePythonCommand();
  if (!python) {
    throw new Error("Python is required for DOCX to DOC conversion.");
  }

  await execFileAsync(python.cmd, [...python.args, DOCX_TO_DOC_SCRIPT, docxPath, docPath], {
    timeout: 120000,
    maxBuffer: 10 * 1024 * 1024,
  });
}

export async function convertPdfToDocxEditable(pdfPath, docxPath) {
  const python = await resolvePythonCommand();
  if (!python) {
    throw new Error(
      "Python is required for editable PDF to DOCX conversion. Install Python 3 and run: pip install pdf2docx"
    );
  }

  const { stderr } = await execFileAsync(python.cmd, [...python.args, SCRIPT, pdfPath, docxPath], {
    timeout: 180000,
    maxBuffer: 10 * 1024 * 1024,
  });

  const match = (stderr || "").match(/REDACTIONS:(\d+)/);
  return { duplicateLayersRemoved: match ? Number(match[1]) : 0 };
}

export async function isPdf2DocxAvailable() {
  const python = await resolvePythonCommand();
  if (!python) return false;
  try {
    await execFileAsync(
      python.cmd,
      [...python.args, "-c", "import pdf2docx"],
      { timeout: 10000 }
    );
    return true;
  } catch {
    return false;
  }
}
