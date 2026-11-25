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
       * Short share links, counted by the page they open. Every link under
       * /reserve/ opens the booking flow and labels the booking
       * "<source>-reserve" (www.ledalat.com/reserve/google is Google's
       * reservation link, /reserve/ig is Instagram's). A plain visit to the
       * homepage carries no tag; the referrer decides, as for any page.
       * lib/attribution.ts saves the tag, then tidies it out of the address
       * bar. Temporary (307), so a link can be repointed later.
       *
       * Older links stay working: /google, /line, /fb and /reservation/google
       * open booking with the same labels, and /ig opens the homepage.
       */
      ...(
        [
          ["reserve/ig", "/reservation?src=instagram-reserve"],
          ["reserve/google", "/reservation?src=google-reserve"],
          ["reserve/line", "/reservation?src=line-reserve"],
          ["reserve/fb", "/reservation?src=facebook-reserve"],
          ["reservation/google", "/reservation?src=google-reserve"],
          ["google", "/reservation?src=google-reserve"],
          ["line", "/reservation?src=line-reserve"],
          ["fb", "/reservation?src=facebook-reserve"],
          ["ig", "/?src=instagram-home"],
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
