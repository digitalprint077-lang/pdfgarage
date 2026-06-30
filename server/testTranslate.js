import {
  translateText,
  detectLanguage,
  resolveSourceLang,
  splitIntoChunks,
  tokenizeStructure,
  countTranslationSegments,
} from "./translateTools.js";
import {
  TRANSLATE_LANGUAGES,
  SUPPORTED_TRANSLATE_CODES,
} from "./translateLanguages.js";

const SAMPLE = {
  en: "Hello, this is a short test sentence for translation.",
  es: "Hola, esta es una frase corta de prueba para traducción.",
  fr: "Bonjour, ceci est une courte phrase de test pour la traduction.",
  de: "Hallo, dies ist ein kurzer Testsatz für die Übersetzung.",
  it: "Ciao, questa è una breve frase di prova per la traduzione.",
  pt: "Olá, esta é uma frase curta de teste para tradução.",
  ru: "Привет, это короткое тестовое предложение для перевода.",
  ja: "こんにちは、これは翻訳のための短いテスト文です。",
  ko: "안녕하세요, 이것은 번역을 위한 짧은 테스트 문장입니다.",
  tr: "Merhaba, bu çeviri için kısa bir test cümlesidir.",
  nl: "Hallo, dit is een korte testzin voor vertaling.",
  pl: "Cześć, to krótkie zdanie testowe do tłumaczenia.",
  id: "Halo, ini adalah kalimat uji pendek untuk terjemahan.",
  vi: "Xin chào, đây là một câu thử nghiệm ngắn cho bản dịch.",
};

let passed = 0;
let failed = 0;

function ok(name) {
  passed++;
  console.log(`  ✓ ${name}`);
}

function fail(name, err) {
  failed++;
  console.error(`  ✗ ${name}: ${err?.message || err}`);
}

async function testAutoDetect() {
  console.log("\nAuto-detect:");
  const cases = [
    ["en", SAMPLE.en],
    ["es", SAMPLE.es],
    ["fr", SAMPLE.fr],
    ["de", SAMPLE.de],
  ];
  for (const [expected, text] of cases) {
    const detected = detectLanguage(text);
    if (detected === expected) ok(`detect ${expected}`);
    else fail(`detect ${expected}`, `got ${detected}`);
  }

  const resolved = resolveSourceLang("auto", SAMPLE.es);
  if (resolved === "es") ok("resolve auto → es");
  else fail("resolve auto → es", `got ${resolved}`);
}

async function testLanguagePairs() {
  console.log("\nLanguage pairs (→ English):");
  const targets = [...SUPPORTED_TRANSLATE_CODES].filter((c) => c !== "en");

  for (const from of targets) {
    const text = SAMPLE[from] || SAMPLE.en;
    try {
      const result = await translateText(text, from, "en");
      if (result && result.length > 0 && !/INVALID/i.test(result)) {
        ok(`${from} → en`);
      } else {
        fail(`${from} → en`, result || "empty result");
      }
    } catch (err) {
      fail(`${from} → en`, err);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
}

async function testAutoToSpanish() {
  console.log("\nAuto-detect translation:");
  try {
    const result = await translateText(SAMPLE.en, "auto", "es");
    if (result && result.length > 0 && !/INVALID/i.test(result)) ok("auto (en) → es");
    else fail("auto (en) → es", result || "empty result");
  } catch (err) {
    fail("auto (en) → es", err);
  }
}

async function testInvalidLang() {
  console.log("\nValidation:");
  try {
    await translateText("hello", "xx", "en");
    fail("reject invalid source", "should have thrown");
  } catch {
    ok("reject invalid source");
  }
  try {
    await translateText("hello", "en", "xx");
    fail("reject invalid target", "should have thrown");
  } catch {
    ok("reject invalid target");
  }
}

async function testBatching() {
  console.log("\nRequest batching:");
  const lines = Array.from({ length: 40 }, (_, i) => `Line ${i + 1} with some sample text.`).join("\n");
  const perLine = tokenizeStructure(lines).filter((t) => t.kind === "text").length;
  const batched = countTranslationSegments(lines);
  if (batched < perLine) ok(`batched ${perLine} line tokens into ${batched} API segments`);
  else fail("batching", `perLine=${perLine}, batched=${batched}`);
}

async function testStructurePreserved() {
  console.log("\nStructure preservation:");
  const input = "First paragraph ends here.\n\nSecond paragraph starts.\nSecond line stays.";
  const tokens = tokenizeStructure(input);
  const breaks = tokens.filter((t) => t.kind === "break").map((t) => t.value);
  if (breaks.includes("\n\n") && breaks.includes("\n")) ok("tokenize paragraphs and lines");
  else fail("tokenize", JSON.stringify(breaks));

  try {
    const result = await translateText(input, "en", "it");
    const afterPara = result.split("\n\n")[1];
    if (result.includes("\n\n") && afterPara?.includes("\n")) ok("translate keeps \\n\\n and \\n");
    else fail("translate structure", `parts=${result.split("\n\n").length}`);
  } catch (err) {
    fail("translate structure", err);
  }
}

async function testLongText() {
  console.log("\nLong text chunking:");
  const longText = "This is a sample sentence for translation testing. ".repeat(80);
  const chunks = splitIntoChunks(longText);
  const allValid = chunks.every((c) => c.length <= 480);
  if (allValid && chunks.length > 1) ok(`split ${longText.length} chars into ${chunks.length} chunks`);
  else fail("chunk split", `chunks=${chunks.length}, max=${Math.max(...chunks.map((c) => c.length))}`);

  try {
    const result = await translateText(longText.slice(0, 1200), "en", "it");
    if (result && result.length > 0 && !/QUERY LENGTH|INVALID/i.test(result)) {
      ok("translate long text (en → it)");
    } else {
      fail("translate long text", result || "empty");
    }
  } catch (err) {
    fail("translate long text", err);
  }
}

async function testApiListSync() {
  console.log("\nCatalog:");
  const codes = TRANSLATE_LANGUAGES.filter((l) => l.code !== "auto").map((l) => l.code);
  if (codes.length === SUPPORTED_TRANSLATE_CODES.size) {
    ok(`${codes.length} translate languages registered`);
  } else {
    fail("language list", `TRANSLATE_LANGUAGES=${codes.length}, SUPPORTED=${SUPPORTED_TRANSLATE_CODES.size}`);
  }
}

console.log("Translation language tests");

await testApiListSync();
await testAutoDetect();
await testInvalidLang();
await testBatching();
await testAutoToSpanish();
await testStructurePreserved();
await testLongText();
await testLanguagePairs();

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
