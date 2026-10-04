const defaults = {
  settings: { geminiApiKey: '', theme: 'system', language: 'en', sensitiveConfirmation: true },
  documents: [], profiles: [], mappings: [], applicationSessions: []
};

const hasChromeStorage = typeof chrome !== 'undefined' && chrome.storage?.local;

export async function getStorage(key) {
  if (hasChromeStorage) return (await chrome.storage.local.get(key))[key] ?? defaults[key];
  const value = localStorage.getItem(`laff:${key}`);
  return value ? JSON.parse(value) : defaults[key];
}

export async function setStorage(key, value) {
  if (hasChromeStorage) return chrome.storage.local.set({ [key]: value });
  localStorage.setItem(`laff:${key}`, JSON.stringify(value));
}

export async function clearAllStorage() {
  if (hasChromeStorage) return chrome.storage.local.clear();
  Object.keys(defaults).forEach((key) => localStorage.removeItem(`laff:${key}`));
}

export { defaults };
