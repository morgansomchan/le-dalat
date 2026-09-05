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
    ];
  },
};

export default nextConfig;
