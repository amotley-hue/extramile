# Launch runbook

Everything between "the code is written" and "the site is live and taking
bookings."

**Why you have to do these steps yourself:** every one of them means creating an
account, agreeing to terms, or entering a payment card. Those have to be done by
the person who owns the business and the money. The instructions below are exact
so it's a matter of following them, not figuring them out.

Work top to bottom. Steps 1–4 get you a live site. Steps 5–7 turn on instant
pricing and email. Steps 8–10 are the ones that actually bring in customers.

Budget: **about $30 up front and roughly $8–15/month** at typical volume, plus
Google Maps usage that will almost certainly stay inside the free monthly credit.

---

## 1. Register the domain — `extramilelimo.com`

Verified available at the time of writing. Availability changes; if it's gone,
`theextramilelimo.com` and `ridetheextramile.com` were also free.

**Register it in Craig's name, on Craig's card.** The domain is the business —
email, website and Google listing all hang off it. If it sits in someone else's
account then a forgotten renewal, a lost password or a parted-ways developer
takes the whole business offline, and recovering a domain from a third party is
genuinely hard. Whoever does the technical setup can be granted DNS access
without owning the registration.

1. Go to [Cloudflare Registrar](https://dash.cloudflare.com) (at-cost pricing,
   ~$10/yr, free WHOIS privacy, no upsell funnel) or Namecheap if you'd rather.
   **Avoid GoDaddy** — the renewal pricing and the upsells aren't worth it.
2. Search `extramilelimo.com` and buy it. One year is fine; auto-renew **on**.
3. Turn on WHOIS/domain privacy. It's free at Cloudflare. This keeps Craig's
   home address and phone out of the public WHOIS database and off spam lists.

> **On `.co` vs `.com`:** you floated `extramilelimo.co`. Get the `.com`. People
> type `.com` by reflex, Craig will be saying this domain out loud on the phone,
> and if someone else ever registers the `.com` they'll quietly collect traffic
> meant for you. If you want the `.co` too, buy it and redirect it — but the
> `.com` is the one on the business cards.

---

## 2. Business email — `craig@extramilelimo.com`

You asked for a domain-specific Gmail. That's **Google Workspace** — the same
Gmail interface, but sending from your own domain. A Gmail address like
`extramilelimo@gmail.com` is free, but `craig@extramilelimo.com` is what a
corporate travel manager expects to see, and it costs $7/month.

1. Go to [workspace.google.com](https://workspace.google.com) → **Get started**.
2. Business name: `The Extra Mile Limousine Service`. Employees: **Just you**.
   Region: **United States**.
3. Choose **Yes, I have one I can use** and enter `extramilelimo.com`.
4. Create the username `craig`. That becomes `craig@extramilelimo.com`.
5. Pick **Business Starter** ($7/user/month).
6. Google will ask you to **verify the domain** by adding a TXT record. Add it
   in the Cloudflare DNS panel: type `TXT`, name `@`, value = the string Google
   gives you.
7. Then add the **MX records** Google lists, in the same DNS panel. Without
   these, mail to `craig@extramilelimo.com` goes nowhere.
8. Send yourself a test from a personal address and confirm it arrives.

**Also set up these free aliases** (Workspace → Users → Craig → Add alias) so
you're not handing out a personal address for every purpose:

- `bookings@extramilelimo.com` — where the site sends new requests
- `hello@extramilelimo.com` — general inquiries

> If $7/month is a hard no right now: register the domain anyway, use a free
> Gmail temporarily, and add Workspace later. But do it before spending money on
> advertising — a Gmail address in an ad undercuts a premium price.

---

## 3. Put the code on GitHub

The repo is already initialized and committed locally at
`C:\Users\amotl\extramile`.

1. Create a free account at [github.com](https://github.com) if you don't have
   one.
2. Create a **new private repository** named `extramile`. Do **not**
   initialize it with a README — the repo already has one.
3. GitHub will show you commands. From the project folder, run:

```bash
git remote add origin https://github.com/YOUR-USERNAME/extramile.git
git branch -M main
git push -u origin main
```

Private is the right call: the repo contains business logic and pricing
structure. No secrets are in it — those live in Vercel — but there's no upside
to publishing it.

---

## 4. Deploy on Vercel

Vercel is free at this scale and is built by the same people as Next.js.

1. Go to [vercel.com](https://vercel.com) → **Sign up with GitHub**.
2. **Add New → Project** → import `extramile`.
3. Vercel detects Next.js automatically. Leave every build setting alone.
4. **Deploy**. About a minute. You'll get a URL like
   `extramile.vercel.app` — the real site, on a temporary address.
5. **Project → Settings → Domains** → add `extramilelimo.com` and
   `www.extramilelimo.com`.
6. Vercel shows the DNS records to add. Put them in Cloudflare DNS. If the
   domain is registered at Cloudflare, set those records' proxy status to **DNS
   only** (grey cloud, not orange) — Vercel handles the CDN and SSL itself.
7. Wait for the certificate to issue (usually minutes). Then
   `https://extramilelimo.com` is live.

**The site works at this point.** The quote step will say pricing isn't switched
on yet and invite the customer to send the trip through — which is honest and
still captures the lead. Steps 5–7 upgrade that.

---

## 5. Email delivery — Resend

Without this, booking requests have no way to reach Craig.

Sending from your own app through Gmail's SMTP is unreliable and gets flagged as
spam. Resend is purpose-built for this and free up to 3,000 emails/month — far
more than Craig will send.

1. Sign up at [resend.com](https://resend.com).
2. **Domains → Add Domain** → `extramilelimo.com`.
3. Resend gives you DKIM and SPF records. Add them in Cloudflare DNS.
4. Wait for **Verified**.
5. **API Keys → Create API Key**, permission **Sending access**. Copy it — it's
   shown once.

> ⚠️ If you already added Google Workspace SPF records in step 2, you'll now
> have two SPF entries. **A domain may only have one `TXT` SPF record.** Merge
> them into a single record:
> `v=spf1 include:_spf.google.com include:amazonses.com ~all`
> Two separate SPF records will break delivery for both.

---

## 6. Instant pricing — Mapbox

This is the feature that beats both competitor sites. Mapbox was chosen over
Google Maps because Google requires a payment card before it will serve a single
request; Mapbox's free tiers are usable without one, at least at signup.

1. Sign up at [account.mapbox.com](https://account.mapbox.com).
2. Go to **Tokens → Create a token**.
3. Name it `extramile-server`. Under **Scopes**, leave the default *public*
   scopes checked — the site only reads. Do **not** enable any `write` scope.
4. Leave **URL restrictions empty.** The token is used server-side only, so
   there is no referrer to restrict against; its secrecy is the control, which
   is why it never goes in a `NEXT_PUBLIC_` variable.
5. Copy the token. It starts `pk.`.

**What it costs.** Three products are in play, each with its own free tier:

| Product | Used for | Free tier | Above that |
| --- | --- | --- | --- |
| Search Box *sessions* | Address autocomplete | 500 / month | $3 per 1,000 |
| Geocoding v6 | Re-pricing on booking | 100,000 / month | $0.75 per 1,000 |
| Directions | Driving distance | 100,000 / month | $2 per 1,000 |

The one to watch is **Search Box sessions — 500/month is not enormous.** The
site is built to spend them carefully: one session covers a customer's entire
quote no matter how many keystrokes, airport picks cost nothing at all, and
re-pricing at booking uses the per-request geocoder instead of opening a second
session. Realistically Craig would need well over 500 quote attempts in a month
to pay anything, and the overage is a few dollars.

Set a spending limit anyway: **Account → Settings → Billing → set a usage
alert.** You want to hear about it the day something goes wrong, not at
month end.

The site also rate-limits these endpoints per visitor, so a scraper can't run up
the bill through the site itself.

---

## 7. Booking request log — Supabase (recommended)

Email is how Craig finds out about a request. This is the backup that means a
bounced, spam-filed, or accidentally-deleted email never costs a customer.

Free tier is plenty.

1. Sign up at [supabase.com](https://supabase.com) → **New project**.
   Name `extramile`, region **East US**, and save the database password
   somewhere safe.
2. **SQL Editor → New query**. Paste the entire contents of
   `supabase/schema.sql` from this repo and **Run**.
3. **Project Settings → API**, copy:
   - **Project URL**
   - **`service_role` secret** (not `anon` — the server needs the privileged one)

> The table has Row Level Security on with no policies, so the public key can
> read nothing even if it leaks. Customer phone numbers live in this table;
> that's why it's locked down. Never put the `service_role` key anywhere the
> browser can see it.

---

## 8. Wire up the keys in Vercel

**Vercel → Project → Settings → Environment Variables.** Add each of these for
**Production, Preview, and Development**:

| Name | Value |
| --- | --- |
| `MAPBOX_ACCESS_TOKEN` | token from step 6 (starts `pk.`) |
| `RESEND_API_KEY` | key from step 5 |
| `BOOKING_FROM_EMAIL` | `The Extra Mile <bookings@extramilelimo.com>` |
| `BOOKING_TO_EMAIL` | `craig@extramilelimo.com` |
| `SUPABASE_URL` | project URL from step 7 |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role secret from step 7 |

Then **Deployments → ⋯ on the latest → Redeploy**. Environment variables are
read at build time; without a redeploy nothing changes.

**Now test it properly:** open the live site, run a real quote from your own
address to the airport, and submit it. Confirm three things — Craig's inbox gets
the request, the customer address gets the confirmation, and the row appears in
Supabase under **Table Editor → booking_requests**.

---

## 9. ⚠️ Replace the placeholder rates — DO THIS BEFORE ADVERTISING

**Every price in `src/lib/rates.ts` is invented.** They're benchmarked to
typical Atlanta black-car pricing so the site could be built and demonstrated
end to end, but they are not Craig's rates and he is not obligated to honor
them.

Open `src/lib/rates.ts`. It's the only file you need to touch. For each vehicle
set:

- `baseFare` — what every trip starts at
- `perMileRate` — dollars per mile
- `minimumFare` — the floor for short trips
- `hourlyRate` and `minimumHours` — for hourly charters

Then check `surcharges` (airport fee, after-hours, extra stops, meet & greet,
and the 20% gratuity rate — set `gratuityRate: 0` if Craig would rather leave
gratuity to the customer).

Also update the `examples` field for each vehicle to the cars Craig actually
drives, and `passengers` / `luggage` to their real capacity.

Commit and push; Vercel redeploys automatically:

```bash
git add src/lib/rates.ts && git commit -m "Set real rate card" && git push
```

Run `npm test` first — the pricing tests check the rules still hold (minimums
bind, bigger vehicles cost more) without hard-coding any dollar amount, so they
should stay green with real numbers.

---

## 10. Get found — Google Business Profile

For a local service business this is worth more than the website's SEO. It's
what puts Craig in the map results when someone searches "Atlanta car service."
It's free.

1. [business.google.com](https://business.google.com) → **Manage now**.
2. Name: `The Extra Mile Limousine Service`. Category: **Limousine service**
   (add **Airport shuttle service** and **Car service** as secondary).
3. Choose **"I deliver goods and services to my customers"** and **do not**
   display an address — Craig is a service-area business, not a storefront.
4. Service areas: Atlanta, Buckhead, Sandy Springs, Alpharetta, Marietta,
   Decatur, and the rest from `src/lib/business.ts`.
5. Phone `678-457-0698`, website `https://extramilelimo.com`.
6. Verify — usually by postcard to Craig's address (5–14 days) or by phone.
7. Once verified: add photos (the vehicle shots from
   `public/images/README.md`), set hours to **Open 24 hours**, and turn
   messaging **off** unless Craig will actually watch it.

**Then ask every satisfied customer for a review.** Reviews are the single
biggest factor in local ranking, and the competitor sites don't have many. The
site has no testimonials on it right now precisely because inventing them isn't
an option — real ones are worth waiting for.

Also submit the sitemap: [Google Search Console](https://search.google.com/search-console)
→ add `extramilelimo.com` → **Sitemaps** → submit `sitemap.xml`.

---

## Quick reference

| Thing | Where | Cost |
| --- | --- | --- |
| Domain | Cloudflare Registrar | ~$10/yr |
| Email | Google Workspace | $7/mo |
| Hosting | Vercel Hobby | Free |
| Email sending | Resend | Free to 3k/mo |
| Booking log | Supabase | Free tier |
| Addresses & distance | Mapbox | Free to 500 quotes/mo, then ~$3/1k |
| Google Business Profile | Google | Free |

## When something breaks

- **Booking requests not arriving** — Vercel → Deployments → latest → Runtime
  Logs. Check `RESEND_API_KEY` is set and the domain shows Verified in Resend.
- **Quotes say pricing isn't switched on** — `MAPBOX_ACCESS_TOKEN` is missing.
  Environment variables are read at build time, so redeploy after adding it.
- **Addresses don't autocomplete** — check the token starts `pk.` and has no
  URL restriction. Vercel → Deployments → Runtime Logs will show the exact
  Mapbox status code.
- **A customer says the price changed** — they're right to ask. Check
  `src/lib/rates.ts` history in git; the quote is recalculated server-side at
  submission, so a stale browser tab can show an old number.
