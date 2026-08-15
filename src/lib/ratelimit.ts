/**
 * Small in-memory rate limiter.
 *
 * The Places and Routes APIs bill per call, so an unthrottled endpoint is a
 * direct line to Craig's credit card. This caps the damage from a scraper or a
 * runaway client without adding a Redis dependency.
 *
 * Caveat: state lives in one server instance's memory. Across several
 * serverless instances the effective limit is (limit x instances), and it
 * resets on cold start. That is fine as a cost guardrail. If abuse ever becomes
 * real, move this to Upstash or Vercel KV — the call sites don't change.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Bound memory use if a lot of distinct IPs show up. */
const MAX_TRACKED = 10_000;

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();

  if (buckets.size > MAX_TRACKED) {
    for (const [k, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(k);
    }
    // Still oversized after pruning expired entries: drop the oldest wholesale
    // rather than let the map grow without bound.
    if (buckets.size > MAX_TRACKED) buckets.clear();
  }

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;

  if (existing.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  return {
    ok: true,
    remaining: limit - existing.count,
    retryAfterSeconds: 0,
  };
}

/** Best-effort client IP from proxy headers. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function tooManyRequests(retryAfterSeconds: number): Response {
  return Response.json(
    { error: "Too many requests. Please slow down." },
    {
      status: 429,
      headers: { "Retry-After": String(Math.max(1, retryAfterSeconds)) },
    },
  );
}
