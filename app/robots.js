import { APP_URL } from "@/lib/config";

export default function robots() {
  const baseUrl = APP_URL;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
