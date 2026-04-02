import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Providers } from "@/providers";
import { Header } from "@/components/layout/Header";
import { Stars } from "@/components/canvas/Stars";
import "./globals.css";

const saans = localFont({
  src: [
    { path: "./fonts/Saans-Light.ttf",   weight: "300", style: "normal" },
    { path: "./fonts/Saans-Regular.ttf", weight: "400", style: "normal" },
  ],
  variable: "--font-saans",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "system-ui", "sans-serif"],
});

const fenul = localFont({
  src: [{ path: "./fonts/FenulStandard-Medium.ttf", weight: "500", style: "normal" }],
  variable: "--font-fenul",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const metadata: Metadata = {
  title: "AMOK — The Island Paradox",
  description: "Sunset parties and iconic nights in Mallorca.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "AMOK" },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${saans.variable} ${fenul.variable}`}>
      <body>
        <Providers>
          <Stars count={200} zIndex={1} />
          <Header />
          <main style={{ position: "relative", zIndex: 10 }}>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
