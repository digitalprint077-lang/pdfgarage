import translate from "google-translate-api-x";
import { MYMEMORY_LANG } from "./translateLanguages.js";

const MYMEMORY_EMAIL = process.env.MYMEMORY_EMAIL || "";
const LIBRETRANSLATE_URL = (process.env.LIBRETRANSLATE_URL || "").replace(/\/$/, "");
const LIBRETRANSLATE_API_KEY = process.env.LIBRETRANSLATE_API_KEY || "";
const MYMEMORY_MAX = 480;
const GOOGLE_MAX = 4500;

const DEFAULT_PROVIDERS = MYMEMORY_EMAIL && process.env.TRANSLATE_PROVIDERS == null
  ? ["mymemory", "google", "libretranslate"]
  : ["google", "mymemory", "libretranslate"];

export function getTranslateProviders() {
  const raw = process.env.TRANSLATE_PROVIDERS || DEFAULT_PROVIDERS.join(",");
  return raw
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
}

export function getMaxChunkChars() {
  const providers = getTranslateProviders();
  if (providers.includes("google") || providers.includes("libretranslate")) {
    return GOOGLE_MAX;
  }
  return MYMEMORY_MAX;
}

/** App language code → Google / LibreTranslate code */
function toProviderLang(appCode) {
  const code = String(appCode || "").trim().toLowerCase();
  if (code === "zh") return "zh-CN";
  return code;
}

function toMyMemoryLang(appCode) {
  return MYMEMORY_LANG[appCode] || appCode;
}

function isRateLimitError(err) {
  const msg = String(err?.message || err || "").toLowerCase();
  return msg.includes("429") || msg.includes("rate") || msg.includes("quota") || msg.includes("busy");
}

async function callGoogle(core, from, to) {
  const res = await translate(core, {
    from: toProviderLang(from),
    to: toProviderLang(to),
    client: "gtx",
  });
  if (!res?.text) throw new Error("Google Translate returned empty text");
  return res.text;
}

async function callMyMemory(core, from, to) {
  if (core.length > MYMEMORY_MAX) {
    throw new Error(`MyMemory chunk too large (${core.length} chars)`);
  }

  const params = new URLSearchParams({
    q: core,
    langpair: `${toMyMemoryLang(from)}|${toMyMemoryLang(to)}`,
  });
  if (MYMEMORY_EMAIL) params.set("de", MYMEMORY_EMAIL);

  const res = await fetch("https://api.mymemory.translated.net/get", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (res.status === 429) throw new Error("MyMemory rate limit (429)");

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`MyMemory error (${res.status})`);
  }

  if (data.responseStatus === 200) return data.responseData.translatedText;

  const details = String(data.responseDetails || "");
  if (data.responseStatus === 429 || /quota|rate|limit/i.test(details)) {
    throw new Error(`MyMemory rate limit: ${details}`);
  }
  throw new Error(details || "MyMemory translation failed");
}

async function callLibreTranslate(core, from, to) {
  if (!LIBRETRANSLATE_URL) throw new Error("LibreTranslate URL not configured");

  const body = {
    q: core,
    source: toProviderLang(from),
    target: toProviderLang(to),
    format: "text",
  };
  if (LIBRETRANSLATE_API_KEY) body.api_key = LIBRETRANSLATE_API_KEY;

  const res = await fetch(`${LIBRETRANSLATE_URL}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`LibreTranslate error (${res.status})`);

  const data = await res.json();
  if (!data?.translatedText) throw new Error("LibreTranslate returned empty text");
  return data.translatedText;
}

const PROVIDER_FN = {
  google: callGoogle,
  mymemory: callMyMemory,
  libretranslate: callLibreTranslate,
};

let libreAvailable = null;

async function isLibreTranslateAvailable() {
  if (!LIBRETRANSLATE_URL) return false;
  if (libreAvailable !== null) return libreAvailable;
  try {
    const res = await fetch(`${LIBRETRANSLATE_URL}/languages`, { signal: AbortSignal.timeout(3000) });
    libreAvailable = res.ok;
  } catch {
    libreAvailable = false;
  }
  return libreAvailable;
}

export async function getTranslateProviderStatus() {
  const configured = getTranslateProviders();
  const status = {};

  status.google = { configured: configured.includes("google"), available: configured.includes("google") };
  status.mymemory = {
    configured: configured.includes("mymemory"),
    available: configured.includes("mymemory"),
    emailSet: Boolean(MYMEMORY_EMAIL),
  };
  status.libretranslate = {
    configured: configured.includes("libretranslate"),
    available: configured.includes("libretranslate") && (await isLibreTranslateAvailable()),
    url: LIBRETRANSLATE_URL || null,
  };

  status.primary =
    configured.find((p) => {
      if (p === "libretranslate") return status.libretranslate.available;
      return status[p]?.available;
    }) || configured[0];

  return status;
}

/**
 * Translate one text segment using configured providers in order.
 */
export async function translateWithProviders(core, fromLang, toLang) {
  const providers = getTranslateProviders();
  const errors = [];

  for (const name of providers) {
    const fn = PROVIDER_FN[name];
    if (!fn) continue;

    if (name === "libretranslate") {
      if (!(await isLibreTranslateAvailable())) {
        errors.push("LibreTranslate: not running");
        continue;
      }
    }

    try {
      return await fn(core, fromLang, toLang);
    } catch (err) {
      errors.push(`${name}: ${err.message}`);
      if (isRateLimitError(err)) continue;
    }
  }

  throw new Error(
    errors.length
      ? `All translation providers failed — ${errors.join("; ")}`
      : "No translation providers configured"
  );
}
