const CACHE_PREFIX = "gm_cache_";
const CACHE_VERSION = "v1";

function cacheKey(name) {
  return CACHE_PREFIX + name + "_" + CACHE_VERSION;
}

export function loadCache(name) {
  try {
    const raw = localStorage.getItem(cacheKey(name));
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveCache(name, data) {
  try {
    localStorage.setItem(cacheKey(name), JSON.stringify(data));
  } catch (e) {
    // quota cheia ou indisponivel: ignora
  }
}
