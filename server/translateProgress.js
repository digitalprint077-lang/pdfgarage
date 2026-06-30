const store = new Map();
const TTL_MS = 15 * 60 * 1000;

export function setTranslateProgress(id, data) {
  if (!id) return;
  store.set(id, { ...data, updatedAt: Date.now() });
}

export function getTranslateProgress(id) {
  if (!id) return null;
  const entry = store.get(id);
  if (!entry) return null;
  if (Date.now() - entry.updatedAt > TTL_MS) {
    store.delete(id);
    return null;
  }
  return entry;
}

export function clearTranslateProgress(id) {
  if (id) store.delete(id);
}
