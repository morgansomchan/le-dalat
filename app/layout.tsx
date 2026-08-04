import type { Metadata } from "next";
import { Fraunces, Jost } from "next/font/google";
import "./globals.css";

/**
 * Typography (design_brief.md §4):
 * - Fraunces: high-contrast serif with Belle Epoque character. Headlines,
 *   timeline dates, italic accent lines.
 * - Jost: quiet geometric sans echoing the logo lettering. UI, body,
 *   letterspaced uppercase eyebrows and buttons.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
  variable: "--font-fraunces",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  title: "Le Dalat — Vietnamese Fine Dining, Bangkok · Since 1983",
  description:
    "A hidden garden on Sukhumvit Soi 23. Vietnamese fine dining in a wooden villa, family run since 1983.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-US"
      className={`${fraunces.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
