/** Quick check: presentation formats in catalog + server PRESENTATION_FORMATS alignment */
import { readFileSync } from "fs";
import { pathToFileURL } from "url";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

// Parse catalog.ts presentation entries (avoid TS import in plain node)
const catalogSrc = readFileSync(path.join(root, "src/data/catalog.ts"), "utf8");
const presentationBlock = catalogSrc.match(/\/\/ Presentations[\s\S]*?\/\/ E-books/)[0];
const catalogIds = [...presentationBlock.matchAll(/id: "([^"]+)"/g)].map((m) => m[1]);

const converterSrc = readFileSync(path.join(root, "server/converter.js"), "utf8");
const setMatch = converterSrc.match(/const PRESENTATION_FORMATS = new Set\(\[([\s\S]*?)\]\)/);
const serverIds = setMatch[1].match(/"([^"]+)"/g).map((s) => s.replace(/"/g, ""));

const expected = ["dps", "key", "odp", "pot", "potx", "pps", "ppsx", "ppt", "pptm", "pptx", "sda"];

let ok = true;
function fail(msg) {
  console.error("FAIL:", msg);
  ok = false;
}

if (catalogIds.length !== 11) fail(`catalog has ${catalogIds.length} slides, expected 11`);
for (const id of expected) {
  if (!catalogIds.includes(id)) fail(`catalog missing ${id}`);
  if (!serverIds.includes(id)) fail(`server missing ${id}`);
}
if (catalogIds.length !== serverIds.length) {
  fail(`catalog/server count mismatch: ${catalogIds.length} vs ${serverIds.length}`);
}

console.log("Presentation formats (catalog):", catalogIds.join(", "));
console.log("Presentation formats (server):  ", serverIds.join(", "));
console.log(ok ? "PASS: all 11 slide formats registered in catalog and server" : "Some checks failed");
process.exit(ok ? 0 : 1);
