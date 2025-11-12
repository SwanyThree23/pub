# Advanced Caching Strategies

> **Maximize cache hits and minimize redundant API calls**

---

## 🎯 Overview

Caching is one of the most effective cost optimization strategies:
- **40-60% cost reduction** through cache hits
- **Faster response times** (milliseconds vs seconds)
- **Reduced API load** and rate limit concerns
- **Improved reliability** (cache as fallback)

---

## 📊 Cache Architecture

```yaml
cache_layers:

  level_1_memory:
    type: "In-memory (Node.js)"
    speed: "~1ms"
    capacity: "Limited (100-1000 items)"
    ttl: "5-15 minutes"
    use_for: "Hot content, recent requests"

  level_2_redis:
    type: "Redis"
    speed: "~5-10ms"
    capacity: "Large (millions of items)"
    ttl: "1-30 days"
    use_for: "Most content"

  level_3_database:
    type: "MongoDB/PostgreSQL"
    speed: "~50-100ms"
    capacity: "Unlimited"
    ttl: "Permanent with timestamps"
    use_for: "Historical data, analytics"
```

---

## 🔧 Implementation

### Level 1: In-Memory Cache

```javascript
/**
 * Fast in-memory cache using LRU (Least Recently Used)
 * Perfect for hot content that's accessed frequently
 */

const LRU = require('lru-cache');

class MemoryCache {
  constructor(options = {}) {
    this.cache = new LRU({
      max: options.maxSize || 500,  // Max items
      maxAge: options.ttl || 15 * 60 * 1000,  // 15 minutes default
      updateAgeOnGet: true  // Refresh TTL on access
    });

    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0
    };
  }

  /**
   * Get item from cache
   */
  get(key) {
    const value = this.cache.get(key);

    if (value !== undefined) {
      this.stats.hits++;
      return value;
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Set item in cache
   */
  set(key, value, ttl) {
    this.cache.set(key, value, ttl);
    this.stats.sets++;
  }

  /**
   * Check if key exists
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Clear entire cache
   */
  clear() {
    this.cache.reset();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      sets: this.stats.sets,
      hit_rate: hitRate.toFixed(2) + '%',
      size: this.cache.length,
      max_size: this.cache.max
    };
  }
}

// Usage
const memCache = new MemoryCache({ maxSize: 1000, ttl: 10 * 60 * 1000 });

// Try cache first
let content = memCache.get('blog_post_123');

if (!content) {
  // Cache miss - generate content
  content = await generateContent(...);

  // Store in cache
  memCache.set('blog_post_123', content);
}

// Use content
return content;
```

### Level 2: Redis Cache

```javascript
/**
 * Redis-backed cache for distributed caching
 * Survives application restarts, shared across instances
 */

const Redis = require('ioredis');

class RedisCache {
  constructor(options = {}) {
    this.redis = new Redis({
      host: options.host || 'localhost',
      port: options.port || 6379,
      password: options.password,
      db: options.db || 0,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    this.defaultTTL = options.defaultTTL || 7 * 24 * 60 * 60; // 7 days

    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      errors: 0
    };
  }

  /**
   * Get item from Redis
   */
  async get(key) {
    try {
      const value = await this.redis.get(key);

      if (value) {
        this.stats.hits++;

        // Update access timestamp for analytics
        await this.redis.zadd('cache:access_log', Date.now(), key);

        return JSON.parse(value);
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      this.stats.errors++;
      console.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * Set item in Redis
   */
  async set(key, value, ttl = null) {
    try {
      const serialized = JSON.stringify(value);
      const expiry = ttl || this.defaultTTL;

      await this.redis.setex(key, expiry, serialized);
      this.stats.sets++;

      // Track cache keys for management
      await this.redis.zadd('cache:keys', Date.now(), key);

      return true;
    } catch (error) {
      this.stats.errors++;
      console.error('Redis set error:', error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async has(key) {
    try {
      const exists = await this.redis.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  /**
   * Delete key
   */
  async delete(key) {
    try {
      await this.redis.del(key);
      await this.redis.zrem('cache:keys', key);
      return true;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async deletePattern(pattern) {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);

        // Remove from tracking
        for (const key of keys) {
          await this.redis.zrem('cache:keys', key);
        }
      }
      return keys.length;
    } catch (error) {
      console.error('Redis deletePattern error:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    try {
      const totalKeys = await this.redis.zcard('cache:keys');
      const memoryUsage = await this.redis.info('memory');

      const total = this.stats.hits + this.stats.misses;
      const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        sets: this.stats.sets,
        errors: this.stats.errors,
        hit_rate: hitRate.toFixed(2) + '%',
        total_keys: totalKeys,
        memory_usage: this.parseMemoryUsage(memoryUsage)
      };
    } catch (error) {
      console.error('Redis getStats error:', error);
      return null;
    }
  }

  parseMemoryUsage(info) {
    const match = info.match(/used_memory_human:(.+)/);
    return match ? match[1].trim() : 'unknown';
  }

  /**
   * Get most accessed keys
   */
  async getHotKeys(limit = 10) {
    try {
      const keys = await this.redis.zrevrange(
        'cache:access_log',
        0,
        limit - 1,
        'WITHSCORES'
      );

      const hotKeys = [];
      for (let i = 0; i < keys.length; i += 2) {
        hotKeys.push({
          key: keys[i],
          last_access: new Date(parseInt(keys[i + 1])),
          access_count: await this.redis.zscore('cache:access_count', keys[i]) || 0
        });
      }

      return hotKeys;
    } catch (error) {
      console.error('Redis getHotKeys error:', error);
      return [];
    }
  }

  /**
   * Clean up expired keys
   */
  async cleanup() {
    try {
      const allKeys = await this.redis.zrange('cache:keys', 0, -1);
      let deletedCount = 0;

      for (const key of allKeys) {
        const exists = await this.redis.exists(key);
        if (exists === 0) {
          // Key expired but still in tracking set
          await this.redis.zrem('cache:keys', key);
          deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      console.error('Redis cleanup error:', error);
      return 0;
    }
  }

  /**
   * Close connection
   */
  async close() {
    await this.redis.quit();
  }
}

// Usage
const redisCache = new RedisCache({
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
  defaultTTL: 7 * 24 * 60 * 60  // 7 days
});

// Try cache
let content = await redisCache.get('blog_post_123');

if (!content) {
  // Generate content
  content = await generateContent(...);

  // Cache for 7 days
  await redisCache.set('blog_post_123', content, 7 * 24 * 60 * 60);
}

return content;
```

### Multi-Layer Cache Strategy

```javascript
/**
 * Multi-layer cache that checks memory, then Redis, then generates
 * Provides optimal performance with fallback layers
 */

class MultiLayerCache {
  constructor(memoryCache, redisCache) {
    this.memory = memoryCache;
    this.redis = redisCache;

    this.stats = {
      memory_hits: 0,
      redis_hits: 0,
      misses: 0
    };
  }

  /**
   * Get from cache (checks all layers)
   */
  async get(key) {
    // Layer 1: Memory cache (fastest)
    let value = this.memory.get(key);
    if (value) {
      this.stats.memory_hits++;
      return { value, source: 'memory' };
    }

    // Layer 2: Redis (fast)
    value = await this.redis.get(key);
    if (value) {
      this.stats.redis_hits++;

      // Promote to memory cache for faster future access
      this.memory.set(key, value);

      return { value, source: 'redis' };
    }

    // Cache miss
    this.stats.misses++;
    return { value: null, source: 'miss' };
  }

  /**
   * Set in all cache layers
   */
  async set(key, value, options = {}) {
    const memoryTTL = options.memoryTTL || 15 * 60 * 1000;  // 15 min
    const redisTTL = options.redisTTL || 7 * 24 * 60 * 60;  // 7 days

    // Set in memory (hot cache)
    this.memory.set(key, value, memoryTTL);

    // Set in Redis (persistent cache)
    await this.redis.set(key, value, redisTTL);
  }

  /**
   * Delete from all layers
   */
  async delete(key) {
    this.memory.delete(key);
    await this.redis.delete(key);
  }

  /**
   * Get comprehensive stats
   */
  async getStats() {
    const total = this.stats.memory_hits + this.stats.redis_hits + this.stats.misses;

    const memoryStats = this.memory.getStats();
    const redisStats = await this.redis.getStats();

    return {
      total_requests: total,
      memory_hits: this.stats.memory_hits,
      memory_hit_rate: total > 0 ? ((this.stats.memory_hits / total) * 100).toFixed(2) + '%' : '0%',
      redis_hits: this.stats.redis_hits,
      redis_hit_rate: total > 0 ? ((this.stats.redis_hits / total) * 100).toFixed(2) + '%' : '0%',
      overall_hit_rate: total > 0 ?
        (((this.stats.memory_hits + this.stats.redis_hits) / total) * 100).toFixed(2) + '%' : '0%',
      misses: this.stats.misses,
      memory_details: memoryStats,
      redis_details: redisStats
    };
  }
}

// Usage
const cache = new MultiLayerCache(memCache, redisCache);

async function getContent(key, generator) {
  // Try cache
  const cached = await cache.get(key);

  if (cached.value) {
    console.log(`Cache hit from ${cached.source}`);
    return cached.value;
  }

  // Cache miss - generate
  console.log('Cache miss - generating');
  const value = await generator();

  // Store in both cache layers
  await cache.set(key, value);

  return value;
}

// Example
const content = await getContent(
  'blog_post_123',
  () => generateBlogPost(...)
);
```

---

## 🎯 Smart Caching Strategies

### Strategy 1: Content-Based Keys

Generate cache keys based on content parameters:

```javascript
class CacheKeyGenerator {
  /**
   * Generate deterministic cache key from content parameters
   */
  generateKey(params) {
    const normalized = this.normalizeParams(params);
    const hash = this.hashObject(normalized);

    return `content:${params.type}:${hash}`;
  }

  normalizeParams(params) {
    // Sort object keys for consistency
    const sorted = {};
    Object.keys(params).sort().forEach(key => {
      sorted[key] = params[key];
    });
    return sorted;
  }

  hashObject(obj) {
    const crypto = require('crypto');
    const str = JSON.stringify(obj);
    return crypto
      .createHash('sha256')
      .update(str)
      .digest('hex')
      .substring(0, 16);
  }
}

// Usage
const keyGen = new CacheKeyGenerator();

const params = {
  topic: 'Budget Smartphones 2024',
  format: 'blog_post',
  word_count: 1500,
  tone: 'professional',
  sources: ['source1', 'source2']
};

const cacheKey = keyGen.generateKey(params);
// Result: "content:blog_post:a3f7b2c9d1e4f5g6"

// Same params = same key = cache hit!
```

### Strategy 2: Partial Content Caching

Cache reusable components separately:

```javascript
class ComponentCache {
  constructor(cache) {
    this.cache = cache;
  }

  /**
   * Cache individual content components
   */
  async getOrGeneratePost(params) {
    // Check for complete cached post first
    const fullKey = `post:${params.id}`;
    let post = await this.cache.get(fullKey);

    if (post) {
      return post;
    }

    // Build from cached components
    const intro = await this.getOrGenerateIntro(params);
    const mainContent = await this.getOrGenerateMainContent(params);
    const conclusion = await this.getOrGenerateConclusion(params);

    // Assemble post
    post = {
      intro,
      main: mainContent,
      conclusion
    };

    // Cache complete post
    await this.cache.set(fullKey, post);

    return post;
  }

  async getOrGenerateIntro(params) {
    const key = `component:intro:${params.topic}`;
    let intro = await this.cache.get(key);

    if (!intro) {
      intro = await generateIntro(params);
      await this.cache.set(key, intro, 30 * 24 * 60 * 60); // 30 days
    }

    return intro;
  }

  // Similar methods for other components...
}

// Benefits:
// - Intro for "Budget Smartphones" cached once, reused across multiple posts
// - Each component has its own TTL
// - Mix and match cached components
```

### Strategy 3: Preemptive Caching

Cache content before it's requested:

```javascript
class PreemptiveCache {
  constructor(cache, generator) {
    this.cache = cache;
    this.generator = generator;
  }

  /**
   * Pregenerate and cache popular content
   */
  async warmCache(popularTopics) {
    console.log(`Warming cache for ${popularTopics.length} topics...`);

    for (const topic of popularTopics) {
      const key = `post:${topic.id}`;

      // Check if already cached
      const exists = await this.cache.has(key);

      if (!exists) {
        // Generate and cache
        console.log(`Generating ${topic.name}...`);
        const content = await this.generator.generate(topic);
        await this.cache.set(key, content);
      }
    }

    console.log('Cache warmed!');
  }

  /**
   * Schedule regular cache warming
   */
  scheduleWarming(popularTopics, intervalHours = 24) {
    // Warm cache immediately
    this.warmCache(popularTopics);

    // Schedule regular warming
    setInterval(() => {
      this.warmCache(popularTopics);
    }, intervalHours * 60 * 60 * 1000);
  }
}

// Usage
const preemptive = new PreemptiveCache(cache, contentGenerator);

// Warm cache for top 50 topics
preemptive.scheduleWarming(topTopics, 24);  // Every 24 hours
```

### Strategy 4: Cache Invalidation

Smart cache invalidation strategies:

```javascript
class CacheInvalidator {
  constructor(cache) {
    this.cache = cache;
  }

  /**
   * Invalidate related cache entries
   */
  async invalidateRelated(contentId) {
    // Delete main content
    await this.cache.delete(`post:${contentId}`);

    // Delete related entries
    await this.cache.deletePattern(`post:${contentId}:*`);

    // Delete listings that include this content
    await this.cache.deletePattern(`listing:*`);

    console.log(`Invalidated cache for content ${contentId}`);
  }

  /**
   * Time-based invalidation
   */
  async invalidateOld(maxAgeSeconds) {
    const keys = await this.cache.redis.zrange('cache:keys', 0, -1);
    let invalidated = 0;

    for (const key of keys) {
      const ttl = await this.cache.redis.ttl(key);

      if (ttl < maxAgeSeconds) {
        await this.cache.delete(key);
        invalidated++;
      }
    }

    console.log(`Invalidated ${invalidated} old cache entries`);
    return invalidated;
  }

  /**
   * Selective invalidation on update
   */
  async onContentUpdate(contentId, updateType) {
    switch (updateType) {
      case 'minor_edit':
        // Keep cache, mark as stale
        await this.cache.redis.expire(`post:${contentId}`, 60 * 60); // 1 hour
        break;

      case 'major_edit':
        // Invalidate immediately
        await this.invalidateRelated(contentId);
        break;

      case 'delete':
        // Remove all traces
        await this.invalidateRelated(contentId);
        break;
    }
  }
}
```

---

## 📊 Cache Analytics

### Monitor Cache Performance

```javascript
class CacheAnalytics {
  constructor(cache) {
    this.cache = cache;
  }

  /**
   * Analyze cache performance over time
   */
  async analyzePerformance(days = 7) {
    const analysis = {
      hit_rates: [],
      cost_savings: 0,
      hot_keys: [],
      recommendations: []
    };

    // Get daily hit rates
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const dayStats = await this.getDayStats(date);
      analysis.hit_rates.push({
        date: date.toISOString().split('T')[0],
        hit_rate: dayStats.hit_rate,
        requests: dayStats.requests
      });
    }

    // Calculate cost savings
    analysis.cost_savings = this.calculateSavings(analysis.hit_rates);

    // Identify hot keys
    analysis.hot_keys = await this.cache.redis.getHotKeys(20);

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  calculateSavings(hitRates) {
    let totalSavings = 0;
    const costPerGeneration = 0.05; // $0.05 average

    hitRates.forEach(day => {
      const hits = (day.requests * day.hit_rate) / 100;
      const daySavings = hits * costPerGeneration;
      totalSavings += daySavings;
    });

    return totalSavings;
  }

  generateRecommendations(analysis) {
    const recommendations = [];
    const avgHitRate = analysis.hit_rates.reduce(
      (sum, day) => sum + day.hit_rate, 0
    ) / analysis.hit_rates.length;

    if (avgHitRate < 40) {
      recommendations.push({
        priority: 'high',
        category: 'hit_rate',
        message: `Low average hit rate: ${avgHitRate.toFixed(1)}%`,
        actions: [
          'Increase cache TTL',
          'Implement preemptive caching for popular content',
          'Review cache key generation for consistency'
        ]
      });
    }

    // Check for cold keys (cached but never accessed)
    const coldKeysRatio = await this.calculateColdKeysRatio();
    if (coldKeysRatio > 0.3) {
      recommendations.push({
        priority: 'medium',
        category: 'efficiency',
        message: `${(coldKeysRatio * 100).toFixed(0)}% of cached items never accessed`,
        actions: [
          'Be more selective about what to cache',
          'Reduce TTL for rarely accessed content',
          'Implement access-based caching'
        ]
      });
    }

    return recommendations;
  }

  async calculateColdKeysRatio() {
    const allKeys = await this.cache.redis.zcard('cache:keys');
    const accessedKeys = await this.cache.redis.zcard('cache:access_log');

    return (allKeys - accessedKeys) / allKeys;
  }
}

// Usage
const analytics = new CacheAnalytics(cache);
const performance = await analytics.analyzePerformance(7);

console.log('Cache Performance:', performance);
console.log(`Saved $${performance.cost_savings.toFixed(2)} in 7 days`);
```

---

## ✅ Best Practices

### Do's ✅

1. **Cache Aggressively**: Cache anything that's expensive to generate
2. **Use Appropriate TTLs**: Balance freshness vs hits
3. **Monitor Hit Rates**: Track and optimize constantly
4. **Layer Your Cache**: Memory + Redis for best performance
5. **Warm Caches**: Pregenerate popular content
6. **Invalidate Smartly**: Remove stale data efficiently

### Don'ts ❌

1. **Don't Cache User-Specific Data**: Unless properly keyed
2. **Don't Set TTL Too Low**: Defeats purpose of caching
3. **Don't Cache Everything**: Be selective
4. **Don't Ignore Memory Limits**: Monitor cache size
5. **Don't Skip Invalidation**: Keep cache fresh
6. **Don't Forget Monitoring**: Track performance

---

## 🎯 Quick Start Checklist

```yaml
getting_started:
  - [ ] Set up Redis server
  - [ ] Install caching libraries (ioredis, lru-cache)
  - [ ] Implement basic cache wrapper
  - [ ] Generate cache keys from content params
  - [ ] Set appropriate TTLs (start: 7 days)
  - [ ] Add cache stats tracking
  - [ ] Monitor hit rates
  - [ ] Optimize based on data
  - [ ] Celebrate 40-60% cost savings!
```

---

## 💡 Advanced Topics

### Distributed Caching

For multiple application instances:
- Use Redis Cluster for scale
- Implement cache warming coordination
- Share cache statistics across instances

### Cache Stampede Prevention

Prevent multiple instances from regenerating same content:

```javascript
async function getCachedOrGenerate(key, generator) {
  // Try cache
  let value = await cache.get(key);
  if (value) return value;

  // Acquire lock
  const lockKey = `lock:${key}`;
  const locked = await cache.redis.set(lockKey, '1', 'NX', 'EX', 30);

  if (!locked) {
    // Another instance is generating, wait and retry
    await sleep(1000);
    return getCachedOrGenerate(key, generator);
  }

  // We have the lock, generate
  try {
    value = await generator();
    await cache.set(key, value);
    return value;
  } finally {
    // Release lock
    await cache.redis.del(lockKey);
  }
}
```

---

**Implement these caching strategies to achieve 40-60% cost reduction!**

---

*Version: 1.0*
