# The Extra Mile Limousine Service

Marketing site and booking funnel for an owner-operated luxury chauffeur service
in Atlanta, Georgia. Owner: Craig Mason, 678-457-0698.

**Going live?** Follow [`LAUNCH.md`](./LAUNCH.md) — domain, email, hosting, keys,
and Google Business Profile, in order.

**Changing prices?** [`src/lib/rates.ts`](./src/lib/rates.ts) is the only file
you need. Every number in it is currently a placeholder.

---

## Why it's built this way

Both competitor sites (`theblackfleetatl.com`, `bsbexecutivetransportation.org`)
hand booking off to a third-party portal, and neither publishes a price. So the
two things this site does differently are the two things that were missing:

1. **The whole funnel stays on the site.** Quote to request, no redirect, no
   account, no card.
2. **A real number, up front.** Address to address, priced against a rate card,
   with the breakdown shown — fare, fees, gratuity, total.

Everything else is deliberately absent. There's no customer login, no admin
dashboard, no live tracking, no flight API. Each was considered and cut because
it adds a thing to maintain without making it faster for a customer to book, or
easier for Craig to run his day out of his phone.

## Stack

| | |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript, strict |
| Styling | Tailwind CSS 4 (CSS-first theming in `globals.css`) |
| Validation | Zod 4 |
| Email | Resend |
| Database | Supabase (booking request log only) |
| Addresses & distance | Mapbox Search Box + Geocoding v6 + Directions |
| Tests | Vitest |
| Hosting | Vercel |

## Running it

```bash
npm install
cp .env.example .env.local   # fill in what you have; all of it is optional
npm run dev
```

The site runs with **no environment variables at all**. Without a Mapbox token
the quote step degrades to a request form that says so plainly, rather than
guessing a distance — a wrong price is worse than no price.

```bash
npm run dev        # dev server on :3000
npm run build      # production build
npm test           # pricing engine tests
npm run typecheck  # generate route types, then tsc
npm run check      # typecheck + lint + test
```

## Layout

```
src/
  app/
    page.tsx              Home
    book/                 Quote + booking funnel
    services/ fleet/ about/ faq/ contact/
    api/
      places/route.ts     Autocomplete proxy (keeps the Mapbox token server-side)
      quote/route.ts      Prices a trip
      booking/route.ts    Re-prices server-side, persists, emails
    sitemap.ts robots.ts
  components/
    booking-flow.tsx      The three-step funnel
    address-input.tsx     Places autocomplete combobox
    site-header.tsx site-footer.tsx backdrop.tsx ui.tsx
    local-business-schema.tsx
  lib/
    business.ts           Name, phone, service area — single source of truth
    rates.ts              THE RATE CARD
    quote.ts              Pricing engine (pure functions)
    distance.ts           Mapbox integration
    pricing-service.ts    Trip -> resolved addresses -> route -> quote
    validation.ts         Zod schemas
    notify.ts             Booking emails
    store.ts              Supabase persistence
    ratelimit.ts          Per-IP throttling on metered endpoints
supabase/schema.sql       Run once in the Supabase SQL editor
public/images/README.md   What photos to shoot and where they go
```

## Notes for whoever works on this next

- **`business.ts` and `rates.ts` are the config surface.** Phone number, service
  areas, vehicles, and prices all live there. Changing a phone number should
  never mean grepping through JSX.
- **The pricing engine is pure.** `calculateQuote()` does arithmetic and nothing
  else — no I/O, no `process.env`, no `Date.now()`. That's what makes it
  testable and what makes the server and client agree.
- **Prices are recalculated server-side on submit.** The number the browser
  posts is treated as display only. A posted price is an offer from the
  customer, not a rate Craig agreed to.
- **Quotes are firm, and drive time is a prediction.** Trips bill on time as
  well as distance, so a traffic overrun costs Craig and a clean run earns him
  the difference. That is a deliberate business decision, not an oversight —
  certainty is what this service sells. The lever if it ever stops paying is a
  padding factor on predicted drive time, never billing actual elapsed time.
- **The Mapbox token never reaches the browser.** Every Mapbox call happens in a
  route handler. That's also why the token carries no URL restriction — there is
  no referrer to restrict against, so its secrecy is the control.
- **Search Box is billed per session, not per request.** One token covers a
  customer's whole quote however much they type; airport chips resolve from a
  constant table and cost nothing; re-pricing at booking uses the per-request
  geocoder rather than opening a second session. Changing where the session
  token is minted or reset changes Craig's bill.
- **Airport coordinates are hardcoded** in `business.ts`. Only the airport code
  crosses the wire, so a client cannot spoof a location to move the price.
- **A booking is written to Supabase before email is trusted**, and if neither
  the record nor Craig's notification lands, the customer is told to call rather
  than shown a false confirmation.
- **The tests assert rule shape, not dollar amounts** — minimums bind, bigger
  vehicles cost more, gratuity is computed on the subtotal — so they survive the
  real rate card replacing the placeholders.
- **No testimonials, no review counts, no years-in-business claims** anywhere on
  the site. Nothing was invented. Add them when they're real; `about/page.tsx`
  has a `TODO(craig)` marking exactly what's still needed.

## License

Private and proprietary. © The Extra Mile Limousine Service LLC.
