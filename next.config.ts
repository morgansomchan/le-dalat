import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * One house, one address. ledalatbkk.com is a memorable alias for print,
   * Google Business and LINE — it must never serve a second copy of the site,
   * or search engines split the house's standing between two identical
   * domains. Both spellings land permanently on the canonical www.ledalat.com,
   * carrying the path with them: a card printed with ledalatbkk.com/menu still
   * opens the menu.
   */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "(www\\.)?ledalatbkk\\.com" }],
        destination: "https://www.ledalat.com/:path*",
        permanent: true, // 308 — tells search engines to consolidate, not to keep both
      },
      /**
       * Short share links for bios and profiles: www.ledalat.com/line reads
       * cleaner than a query string and still tells the monthly report where
       * the booking came from. lib/attribution.ts saves the tag, then tidies
       * it out of the address bar. Temporary (307), so a link can be repointed
       * later without browsers remembering the old target.
       */
      ...(
        [
          // Instagram's bio has two links, counted apart: /ig opens the
          // homepage; /reserve (app/reserve/page.tsx) opens the booking flow.
          ["ig", "/?src=instagram-home"],
          ["line", "/reservation?src=line"],
          ["google", "/reservation?src=google"],
          // Google Business's reservation button reads better with the word in it.
          ["reservation/google", "/reservation?src=google"],
          ["fb", "/reservation?src=facebook"],
        ] as const
      ).map(([path, destination]) => ({
        source: `/${path}`,
        destination,
        permanent: false,
      })),
    ];
  },
};

export default nextConfig;
