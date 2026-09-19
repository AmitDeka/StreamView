import { APP_NAME, APP_URL, APP_DESCRIPTION } from "@/lib/config";

export function StructuredData() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": APP_NAME,
      "alternateName": [
        "StreamView Kick",
        "StreamView Multi View",
        "Yatra RP Multi View",
        "Kick and YouTube Multi Stream",
        "StreamView Live"
      ],
      "url": APP_URL,
      "description": APP_DESCRIPTION,
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${APP_URL}/multi-view?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": APP_NAME,
      "url": APP_URL,
      "description": "Watch multiple Kick live streams and YouTube broadcasts simultaneously in an adaptive multi-view interface. Built for the gaming and Yatra RP community.",
      "applicationCategory": "MultimediaApplication",
      "genre": "Gaming, Esports, Roleplay, Live Streaming",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript. Compatible with Chrome, Safari, Firefox, Edge.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
