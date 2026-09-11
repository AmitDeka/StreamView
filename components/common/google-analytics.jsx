"use client";

import Script from "next/script";
import { GA_TRACKING_ID } from "@/lib/config";

export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || GA_TRACKING_ID;

  // Don't render analytics scripts if no measurement ID is provided
  if (!gaId || gaId.trim() === "") {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `,
        }}
      />
    </>
  );
}
