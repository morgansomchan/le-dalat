import Image from "next/image";

/**
 * The full-bleed photography behind each screen of the flow — the same
 * language as the homepage scenes: one image holding the viewport under
 * a warm scrim, crossfading as the guest walks deeper into the house.
 * All slots swappable from the photo bank.
 */

export const PHOTOS = {
  /* the garden wall with the round lattice window — the threshold */
  garden: "/web_assets/Interor+exterior/Copy of Le Dalat_20Oct20250010.jpg",
  /* Le Lotus Bleu bar under the lanterns — inside, lamplit */
  bar: "/web_assets/Interor+exterior/Copy of Le Dalat_20Oct20257183.jpg",
  /* the painted Hanoi street above the brick arch — the house's walls */
  mural: "/web_assets/Interor+exterior/Copy of Le Dalat_20Oct20250305.jpg",
  /* the laden table beneath the lotus lamp — the promise kept */
  feast: "/web_assets/Food/Copy of Le Dalat_20Oct20255148.jpg",
} as const;

export type PhotoKey = keyof typeof PHOTOS;

export default function ScreenPhoto({ active }: { active: PhotoKey }) {
  return (
    <div aria-hidden className="fixed inset-0 -z-10">
      {(Object.keys(PHOTOS) as PhotoKey[]).map((key) => (
        <Image
          key={key}
          src={PHOTOS[key]}
          alt=""
          fill
          priority={key === "garden"}
          sizes="100vw"
          className={`object-cover transition-opacity duration-[1200ms] ease-out ${
            active === key ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {/* the homepage's scrim grammar: navy dusk above, umber lamplight below */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(6,14,28,0.62)_0%,rgba(6,14,28,0.28)_26%,rgba(18,11,5,0.38)_58%,rgba(18,11,5,0.82)_100%)]" />
    </div>
  );
}
