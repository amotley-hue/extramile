import { autocompleteAddress, isMapsConfigured } from "@/lib/distance";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/ratelimit";

/**
 * Address autocomplete proxy. Keeps the Mapbox token server-side and throttles
 * per-keystroke traffic.
 *
 * The session token is threaded through from the browser so every keystroke in
 * one address entry bills as a single Mapbox search session rather than one
 * session per request.
 */
export async function GET(request: Request) {
  const limit = rateLimit(`places:${clientIp(request)}`, 60, 60_000);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const url = new URL(request.url);
  const input = url.searchParams.get("q")?.trim() ?? "";
  const sessionToken = url.searchParams.get("session")?.trim() ?? "";

  if (!isMapsConfigured()) {
    return Response.json({ suggestions: [], configured: false });
  }

  if (input.length < 3 || !sessionToken) {
    return Response.json({ suggestions: [], configured: true });
  }

  try {
    const suggestions = await autocompleteAddress(input, sessionToken);
    return Response.json({ suggestions, configured: true });
  } catch (error) {
    console.error("Autocomplete request failed", error);
    return Response.json({ suggestions: [], configured: true });
  }
}
