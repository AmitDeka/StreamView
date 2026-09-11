import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BookmarkFab } from "@/components/common/bookmark-fab";
import { GoogleAnalytics } from "@/components/common/google-analytics";
import { StructuredData } from "@/components/common/structured-data";
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION, APP_URL } from "@/lib/config";

export const viewport = {
  themeColor: "#09070C",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} - Watch Multiple Kick Streams Together | Yatra RP Multi View`,
    template: `%s | ${APP_NAME}`,
  },
  description: "Watch multiple Kick live streams simultaneously in an adaptive multi-view workspace. Built for gaming fans and the Yatra RP community with zero lag, instant swap, and official Kick players.",
  keywords: [
    "Kick multi stream",
    "Kick multi view",
    "multi view Kick",
    "Yatra RP live streams",
    "Yatra Roleplay Kick",
    "Yatra RP multi view",
    "watch multiple Kick streams",
    "Kick multi stream viewer",
    "GTA V RP Kick",
    "Hindi Kick streams",
    "Kick multistream",
    "multistream kick player",
    "Hathoda Kick",
    "Qayzer4 Kick",
    "Soulcity RP Kick",
    "Kick stream multi screen",
  ],
  authors: [{ name: "Amit Deka", url: "https://github.com/AmitDeka" }],
  creator: "Amit Deka",
  publisher: "StreamView",
  category: "entertainment",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${APP_NAME} - Watch Multiple Kick Streams Together | Yatra RP Multi View`,
    description: "Watch multiple Kick live streams simultaneously in an adaptive multi-view workspace. Dedicated to the Yatra RP community.",
    url: APP_URL,
    siteName: APP_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} - Watch Multiple Kick Streams Together`,
    description: "Discover related live Kick streams and watch them simultaneously in an adaptive multi-view interface.",
    creator: "@AmitDeka",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <StructuredData />
      </head>
      <body className="bg-subtle-grid min-h-screen flex flex-col antialiased selection:bg-brand-orange selection:text-white">
        <GoogleAnalytics />
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <BookmarkFab />
      </body>
    </html>
  );
}
