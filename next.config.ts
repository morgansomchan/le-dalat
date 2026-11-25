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
       * Short share links for bios and profiles: www.ledalat.com/ig reads
       * cleaner than a query string and still tells the monthly report where
       * the booking came from. lib/attribution.ts saves the tag, then tidies
       * it out of the address bar. Temporary (307), so a link can be repointed
       * later without browsers remembering the old target.
       */
      ...(
        [
          ["ig", "instagram"],
          ["line", "line"],
          ["google", "google"],
          ["fb", "facebook"],
        ] as const
      ).map(([path, src]) => ({
        source: `/${path}`,
        destination: `/reservation?src=${src}`,
        permanent: false,
      })),
    ];
  },
};

export default nextConfig;
