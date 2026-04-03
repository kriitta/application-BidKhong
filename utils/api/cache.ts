// ============================================================
// ⚡ Simple In-Memory API Cache
// ============================================================
// Caches API responses for a configurable TTL (Time To Live).
// Used for data that rarely changes (categories, subcategories).
// Call invalidate() or invalidateAll() when data changes.

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const MAX_CACHE_SIZE = 100;

/** Default TTL: 5 minutes */
const DEFAULT_TTL_MS = 5 * 60 * 1000;

/**
 * Get or fetch data with caching.
 * @param key - Unique cache key
 * @param fetcher - Async function that fetches the data
 * @param ttlMs - Time to live in milliseconds (default: 5 min)
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<T> {
  const existing = cache.get(key);
  if (existing && Date.now() - existing.timestamp < ttlMs) {
    return existing.data as T;
  }

  const data = await fetcher();

  // Evict oldest entries if cache exceeds max size
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) cache.delete(oldestKey);
  }

  cache.set(key, { data, timestamp: Date.now() });
  return data;
}

/** Invalidate a specific cache key */
export function invalidateCache(key: string): void {
  cache.delete(key);
}

/** Invalidate all cache entries */
export function invalidateAllCache(): void {
  cache.clear();
}

/** Invalidate cache entries matching a prefix */
export function invalidateCacheByPrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}
