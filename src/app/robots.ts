import type { MetadataRoute } from "next";
import { business } from "@/lib/business";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Nothing under /api is useful to a crawler, and the quote endpoint
        // costs money per call.
        disallow: "/api/",
      },
    ],
    sitemap: `${business.url}/sitemap.xml`,
    host: business.url,
  };
}
