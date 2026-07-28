"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scene 4 — The signature dishes (design_brief.md §3, scene 4).
 * A pinned deck: the section holds the viewport and scroll crossfades
 * between the four dishes in place — one dish at a time, progress dashes
 * below. Under prefers-reduced-motion the deck degrades to a plain
 * stacked flow (no pin, everything visible).
 * Each dish brings its own ground color (amber, basil, ember, royal) —
 * the section's background tweens with the crossfades. The last dish
 * lands on royal, which scene 5 opens on.
 */

/*
 * PLACEHOLDER CONTENT — dish stories await the family's telling, especially
 * the Standing Fish legend. Story lines are deliberately generic scaffolding
 * (placeholder copy must not invent facts). Images are swappable — change a
 * `photos` line to recast from web_assets/Food.
 *
 * VIDEOS — the *-web.mp4 files are 540p re-encodes cut from the originals
 * in web_assets/videos (source files untouched):
 *   standing-fish-web.mp4  ← "Post 1- Standing Fish" (full)
 *   wagyu-pho-web.mp4      ← "#3 - If you love x, you'll love y" (5s–18s)
 *   bo-nuong-web.mp4       ← "#1 - Must Try Menu Guide" (0s–31s)
 * They carry baked-in Thai subtitles; treat as placeholder cuts until
 * English/clean versions are provided.
 */
const PLACEHOLDER_TAG = " [PLACEHOLDER — needs family approval]";

type Dish = {
  name: string;
  story: string;
  /** Ground color the deck tweens to while this dish is on stage.
      Hex literals (not var()) so gsap can interpolate them. */
  ground: string;
  photos: string[];
  video?: string;
  videoCaption?: string;
};

const DISHES: Dish[] = [
  {
    name: "The Standing Fish",
    story:
      "The house legend — how the fish came to stand at the table will be told the family's way.",
    ground: "#8f5a14", // turmeric amber (--color-amber)
    photos: ["/web_assets/Food/Copy of Le Dalat_20Oct20257623.jpg"],
    video: "/web_assets/videos/standing-fish-web.mp4",
    videoCaption: "The standing fish, arriving table-side",
  },
  {
    name: "Wagyu Pho",
    story:
      "A bowl the family will describe themselves — the broth, and the years behind it.",
    ground: "#1f6b45", // basil green (--color-basil)
    photos: ["/web_assets/Food/Copy of Le Dalat_20Oct20256572.jpg"],
    video: "/web_assets/videos/wagyu-pho-web.mp4",
    videoCaption: "Wagyu pho, at the table",
  },
  {
    name: "Bo Nuong",
    story:
      "Fire arrives at the table — the family's telling of this ritual goes here.",
    ground: "#963c1e", // ember (--color-ember)
    photos: ["/web_assets/Food/Copy of Le Dalat_20Oct20250012.jpg"],
    video: "/web_assets/videos/bo-nuong-web.mp4",
    videoCaption: "Bo nuong, over the coals",
  },
  {
    name: "Crepes",
    story: "And to finish, Paris.",
    ground: "#1e4489", // royal (--color-royal) — Paris blue; scene 5 opens on it
    photos: [
      "/web_assets/Food/Copy of LeDalat_Jan91028 3.jpg",
      "/web_assets/Food/Copy of LeDalat_Jan91033 3.JPG",
    ],
  },
];

export default function SceneSignatureDishes() {
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-dishes-head] > *", {
        autoAlpha: 0,
        y: 32,
        duration: 1.4,
        ease: "power2.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: "[data-dishes-head]",
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      const slides = gsap.utils.toArray<HTMLElement>("[data-dish-slide]");
      const dashes = gsap.utils.toArray<HTMLElement>("[data-dish-dash]");

      // Deck mode: viewport-high stage, slides stacked on top of each other
      gsap.set("[data-dish-deck]", { height: "100svh" });
      gsap.set("[data-dish-dashes]", { display: "flex" });
      // Deck mode ground: a solid animated color under a fixed jade-deep
      // melt at the top (the static multi-stop gradient is the
      // reduced-motion fallback; ctx.revert() restores it)
      gsap.set(scope.current, {
        backgroundColor: DISHES[0].ground,
        backgroundImage:
          "linear-gradient(to bottom, var(--color-jade-deep) 0%, rgba(20,47,33,0) 30rem)",
      });
      slides.forEach((slide, i) => {
        gsap.set(slide, { position: "absolute", inset: 0 });
        if (i > 0) gsap.set(slide, { autoAlpha: 0 });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "[data-dish-deck]",
          start: "top top",
          end: () => "+=" + (slides.length - 1) * window.innerHeight,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate(self) {
            const idx = Math.min(
              slides.length - 1,
              Math.round(self.progress * (slides.length - 1)),
            );
            dashes.forEach((d, i) => d.classList.toggle("is-active", i === idx));
          },
        },
      });

      slides.slice(0, -1).forEach((slide, i) => {
        tl.to({}, { duration: 0.6 }) // dwell on the current dish
          .to(slide, { autoAlpha: 0, y: -32, ease: "power1.in", duration: 0.4 })
          // the ground follows the dish: melt to the next color across
          // the whole crossfade
          .to(
            scope.current,
            {
              backgroundColor: DISHES[i + 1].ground,
              ease: "none",
              duration: 0.55,
            },
            "<",
          )
          .fromTo(
            slides[i + 1],
            { autoAlpha: 0, y: 32 },
            { autoAlpha: 1, y: 0, ease: "power1.out", duration: 0.4 },
            "<0.15",
          );
      });
      tl.to({}, { duration: 0.6 }); // dwell on the last dish

      gsap.from("[data-dishes-menu-link]", {
        autoAlpha: 0,
        duration: 1.4,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "[data-dishes-menu-link]",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={scope}
      aria-label="The signature dishes"
      /* Static fallback (reduced motion / no JS): the stacked flow walks
         the four dish grounds top to bottom; deck mode overrides this */
      className="bg-[linear-gradient(to_bottom,var(--color-jade-deep)_0%,var(--color-amber)_16%,var(--color-basil)_40%,var(--color-ember)_62%,var(--color-royal)_84%,var(--color-royal)_100%)]"
    >
      <div data-dishes-head className="mx-auto max-w-2xl px-6 pt-28 pb-16 sm:pt-40 sm:pb-24 sm:text-center">
        <p className="eyebrow">III &middot; The Signature Dishes</p>
        {/* PLACEHOLDER headline — house voice, no factual claims */}
        <h2 className="mt-6 font-serif text-[clamp(2.25rem,9.5vw,2.75rem)] leading-[1.12] text-balance text-parchment sm:text-5xl sm:leading-tight">
          Four dishes tell the story.{" "}
          <em className="text-clay">The rest is dinner.</em>
        </h2>
      </div>

      <div data-dish-deck className="relative">
        {DISHES.map((dish) => (
          <article
            key={dish.name}
            data-dish-slide
            className="flex items-center py-14 sm:py-0"
          >
            <div className="mx-auto grid w-full max-w-7xl gap-7 px-6 sm:grid-cols-[0.75fr_1.25fr] sm:items-center sm:gap-10">
              <div>
                <h3 className="font-serif text-3xl text-parchment sm:text-4xl">
                  {dish.name}
                </h3>
                <p className="mt-4 max-w-prose font-serif text-lg italic leading-relaxed text-cream/85 sm:text-xl">
                  {dish.story}
                  <span className="font-sans text-sm not-italic text-cream/40">
                    {PLACEHOLDER_TAG}
                  </span>
                </p>
              </div>
              {/* Media sized by viewport height so the pinned stage is filled */}
              <div className="flex items-start justify-center gap-3 sm:justify-end sm:gap-6">
                {dish.video && (
                  <figure className="shrink-0">
                    <div className="relative aspect-[9/16] h-[min(34svh,17.5rem)] overflow-hidden rounded-2xl shadow-[0_18px_50px_-12px_rgba(0,0,0,0.5)] sm:h-[min(64svh,40rem)] sm:rounded-3xl">
                      <video
                        src={dish.video}
                        poster={dish.photos[0]}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                    {dish.videoCaption && (
                      <figcaption className="mt-3 text-center font-sans text-[0.625rem] tracking-[0.2em] uppercase text-cream/60">
                        {dish.videoCaption}
                      </figcaption>
                    )}
                  </figure>
                )}
                {dish.photos.map((photo) => (
                  <div
                    key={photo}
                    className={`relative overflow-hidden rounded-2xl shadow-[0_18px_50px_-12px_rgba(0,0,0,0.5)] sm:rounded-3xl ${
                      dish.video
                        ? // matches the video's height, stretches into the remaining width
                          "h-[min(34svh,17.5rem)] min-w-0 flex-1 sm:h-[min(64svh,40rem)]"
                        : "aspect-[4/5] h-[min(25svh,13rem)] shrink-0 sm:h-[min(54svh,33rem)]"
                    }`}
                  >
                    <Image
                      src={photo}
                      alt={dish.name}
                      fill
                      sizes="(min-width: 640px) 40vw, 60vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}

        {/* Progress dashes — deck mode only (display set by JS) */}
        <div
          data-dish-dashes
          className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 gap-2.5"
          aria-hidden
        >
          {DISHES.map((dish) => (
            <span key={dish.name} data-dish-dash className="h-0.5 w-8" />
          ))}
        </div>
      </div>

      <div data-dishes-menu-link className="px-6 py-24 sm:py-28 sm:text-center">
        <Link
          href="/menu"
          className="inline-flex min-h-11 items-center gap-3 font-sans text-[0.6875rem] tracking-[0.25em] uppercase text-gold transition-colors duration-500 hover:text-parchment"
        >
          The full menu
          <span aria-hidden className="h-px w-10 bg-gold/50" />
        </Link>
      </div>
    </section>
  );
}
