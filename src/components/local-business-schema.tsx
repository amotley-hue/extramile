import { airports, business, serviceAreas } from "@/lib/business";
import { vehicle, vehicleFullLabel } from "@/lib/rates";

/**
 * LocalBusiness structured data.
 *
 * This is what populates the rich result in Google — hours, phone, service
 * area, ratings. For a service-area business with no storefront, `areaServed`
 * does the work that a street address would.
 */
export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LimousineService",
    "@id": `${business.url}/#business`,
    name: business.fullName,
    legalName: business.legalName,
    description:
      "Private chauffeur and black car service in Atlanta, Georgia. Airport transfers, corporate travel, and hourly charters.",
    url: business.url,
    telephone: business.phoneHref,
    email: business.email,
    founder: { "@type": "Person", name: business.owner },
    priceRange: "$$$",
    currenciesAccepted: "USD",
    address: {
      "@type": "PostalAddress",
      addressLocality: business.city,
      addressRegion: business.state,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: business.geo.lat,
      longitude: business.geo.lng,
    },
    areaServed: [
      ...serviceAreas.map((area) => ({
        "@type": "City",
        name: `${area}, ${business.state}`,
      })),
      ...airports.map((airport) => ({
        "@type": "Airport",
        name: airport.name,
        iataCode: airport.code,
      })),
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Chauffeur services",
      itemListElement: [
        "Airport transfers",
        "Corporate travel",
        "Hourly charter",
        "Events and special occasions",
      ].map((name) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name,
          description: `${name} in a ${vehicleFullLabel()} seating up to ${vehicle.passengers}, driven by owner ${business.owner}.`,
        },
      })),
    },
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${business.url}/book`,
        actionPlatform: [
          "https://schema.org/DesktopWebPlatform",
          "https://schema.org/MobileWebPlatform",
        ],
      },
      result: { "@type": "Reservation", name: "Chauffeur reservation" },
    },
  };

  return (
    <script
      type="application/ld+json"
      // Values come from our own config, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
