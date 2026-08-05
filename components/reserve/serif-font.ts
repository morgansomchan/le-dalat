import { Cormorant_Garamond } from "next/font/google";

/**
 * The reservation flow's question voice — Cormorant Garamond, per the
 * Gate 5A revision spec. Scoped to /reserve and /reservation/[token]
 * via the --font-reserve-serif variable; the homepage keeps its own
 * serif untouched.
 */
export const reserveSerif = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
  variable: "--font-reserve-serif",
});
