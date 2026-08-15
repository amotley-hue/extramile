import type { MetadataRoute } from "next";
import { business } from "@/lib/business";

const routes = [
  { path: "", priority: 1, changeFrequency: "monthly" as const },
  { path: "/book", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/services", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/fleet", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/about", priority: 0.6, changeFrequency: "yearly" as const },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.7, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${business.url}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
