/**
 * Simple in-memory cache for Workable API responses
 * Prevents rate limiting by caching candidate data
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class Cache {
  private store: Map<string, CacheEntry<any>> = new Map();
  
  /**
   * Get cached data if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  /**
   * Set cached data with TTL (time to live) in seconds
   */
  set<T>(key: string, data: T, ttlSeconds: number = 3600): void {
    const now = Date.now();
    this.store.set(key, {
      data,
      timestamp: now,
      expiresAt: now + (ttlSeconds * 1000),
    });
  }
  
  /**
   * Clear specific cache entry
   */
  clear(key: string): void {
    this.store.delete(key);
  }
  
  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.store.clear();
  }
  
  /**
   * Get cache statistics
   */
  getStats() {
    const entries = Array.from(this.store.entries());
    const now = Date.now();
    
    return {
      totalEntries: entries.length,
      validEntries: entries.filter(([_, entry]) => now <= entry.expiresAt).length,
      expiredEntries: entries.filter(([_, entry]) => now > entry.expiresAt).length,
    };
  }
}

// Export singleton instance
export const cache = new Cache();
