import { priceTrip, type PricedTrip } from "@/lib/pricing-service";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/ratelimit";
import { fieldErrors, quoteRequestSchema } from "@/lib/validation";

export type QuoteResponse = PricedTrip;

export async function POST(request: Request) {
  const limit = rateLimit(`quote:${clientIp(request)}`, 30, 60_000);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = quoteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: "Please check the trip details.",
        fields: fieldErrors(parsed.error),
      },
      { status: 400 },
    );
  }

  return Response.json(await priceTrip(parsed.data));
}
