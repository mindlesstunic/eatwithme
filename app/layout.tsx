/**
 * Root Layout
 *
 * Wraps all pages with header, fonts, and global metadata.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  metadataBase: new URL("https://eatwithme.app"),
  title: {
    default: "EatWithMe - Discover Great Food",
    template: "%s | EatWithMe",
  },
  description:
    "Discover the best food spots recommended by your favorite influencers. Real recommendations from people you trust.",
  keywords: [
    "food",
    "restaurants",
    "recommendations",
    "influencers",
    "food discovery",
  ],
  authors: [{ name: "EatWithMe" }],
  creator: "EatWithMe",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://eatwithme.app",
    siteName: "EatWithMe",
    title: "EatWithMe - Discover Great Food",
    description:
      "Discover the best food spots recommended by your favorite influencers.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EatWithMe - Discover Great Food",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EatWithMe - Discover Great Food",
    description:
      "Discover the best food spots recommended by your favorite influencers.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
