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
`C:\Users\amotl\extramile-limo`.

1. Create a free account at [github.com](https://github.com) if you don't have
   one.
2. Create a **new private repository** named `extramile-limo`. Do **not**
   initialize it with a README — the repo already has one.
3. GitHub will show you commands. From the project folder, run:

```bash
git remote add origin https://github.com/YOUR-USERNAME/extramile-limo.git
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
2. **Add New → Project** → import `extramile-limo`.
3. Vercel detects Next.js automatically. Leave every build setting alone.
4. **Deploy**. About a minute. You'll get a URL like
   `extramile-limo.vercel.app` — the real site, on a temporary address.
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

## 6. Instant pricing — Google Maps Platform

This is the feature that beats both competitor sites. Google gives every account
a recurring monthly credit that covers roughly 10,000 address lookups — Craig
will not come close.

1. Go to [console.cloud.google.com](https://console.cloud.google.com), sign in
   with the Workspace account.
2. Create a project called `extramile-limo`.
3. **Billing** → attach a card. Required even for free-tier use.
4. **APIs & Services → Library** → enable **exactly these two**:
   - **Places API (New)** — address autocomplete
   - **Routes API** — driving distance
5. **Credentials → Create credentials → API key**. Copy it.
6. **Restrict the key immediately.** This matters — an unrestricted key found by
   a scraper gets billed to your card:
   - **Application restrictions:** None. *(The key is used server-side only, so
     there is no referrer or IP to restrict against. This is why step 7's
     secrecy matters.)*
   - **API restrictions: Restrict key** → select only Places API (New) and
     Routes API.
7. **Billing → Budgets & alerts** → create a budget of **$10/month** with email
   alerts at 50% / 90% / 100%. You should never hit it. If you do, something is
   wrong and you want to know that day.

The site also rate-limits these endpoints per visitor, so a scraper can't run up
the bill through the site itself.

---

## 7. Booking request log — Supabase (recommended)

Email is how Craig finds out about a request. This is the backup that means a
bounced, spam-filed, or accidentally-deleted email never costs a customer.

Free tier is plenty.

1. Sign up at [supabase.com](https://supabase.com) → **New project**.
   Name `extramile-limo`, region **East US**, and save the database password
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
| `GOOGLE_MAPS_API_KEY` | key from step 6 |
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
| Maps | Google Cloud | Free credit covers it |
| Google Business Profile | Google | Free |

## When something breaks

- **Booking requests not arriving** — Vercel → Deployments → latest → Runtime
  Logs. Check `RESEND_API_KEY` is set and the domain shows Verified in Resend.
- **Quotes say pricing isn't switched on** — `GOOGLE_MAPS_API_KEY` is missing or
  the two APIs aren't enabled. Redeploy after adding it.
- **Addresses don't autocomplete** — Places API (New) not enabled, or the key
  restriction excludes it.
- **A customer says the price changed** — they're right to ask. Check
  `src/lib/rates.ts` history in git; the quote is recalculated server-side at
  submission, so a stale browser tab can show an old number.
