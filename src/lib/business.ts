/**
 * Single source of truth for business identity, contact info, and service area.
 *
 * Everything user-facing (header, footer, schema.org markup, emails, metadata)
 * reads from here, so changing a phone number is a one-line edit.
 */

export const business = {
  legalName: "The Extra Mile Limousine Service LLC",
  name: "The Extra Mile",
  fullName: "The Extra Mile Limousine Service",
  tagline: "Atlanta's private chauffeur service.",
  owner: "Craig Mason",
  ownerRole: "Owner & Chauffeur",

  phone: "678-457-0698",
  /** E.164, for tel: links and SMS */
  phoneHref: "+16784570698",

  /**
   * TODO(craig): switch to the domain mailbox once Google Workspace is live.
   * See LAUNCH.md step 2.
   */
  email: "craig@extramilelimo.com",

  domain: "extramilelimo.com",
  url: "https://extramilelimo.com",

  city: "Atlanta",
  state: "GA",
  stateFull: "Georgia",
  /**
   * Craig operates as a chauffeur service without a public storefront.
   * A full street address is intentionally omitted from the site; Google
   * Business Profile should be configured as a service-area business.
   */
  serviceAreaLabel: "Metro Atlanta & North Georgia",

  /** Geographic center used for LocalBusiness schema (downtown Atlanta). */
  geo: { lat: 33.749, lng: -84.388 },

  hours: "24 hours a day, 7 days a week — by reservation",

  social: {
    instagram: "",
    facebook: "",
  },
} as const;

/** Airports served, used in the quote form and the airports section. */
export const airports = [
  {
    code: "ATL",
    name: "Hartsfield–Jackson Atlanta International",
    note: "Domestic & International, all concourses",
  },
  {
    code: "PDK",
    name: "DeKalb–Peachtree Airport",
    note: "Private aviation / FBO",
  },
  {
    code: "FTY",
    name: "Fulton County Executive Airport",
    note: "Private aviation / FBO",
  },
  {
    code: "RYY",
    name: "Cobb County International (McCollum Field)",
    note: "Private aviation / FBO",
  },
] as const;

/** Cities and areas covered, used for local SEO and the coverage section. */
export const serviceAreas = [
  "Atlanta",
  "Buckhead",
  "Midtown",
  "Downtown",
  "Sandy Springs",
  "Dunwoody",
  "Brookhaven",
  "Decatur",
  "Alpharetta",
  "Roswell",
  "Marietta",
  "Smyrna",
  "Vinings",
  "Johns Creek",
  "Duluth",
  "Peachtree City",
  "College Park",
  "East Point",
] as const;
