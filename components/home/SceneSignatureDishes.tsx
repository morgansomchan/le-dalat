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
 */

/*
 * Dish copy — family-provided descriptions (Aug 2026). Images are swappable.
 *
 * VIDEOS — the *-web.mp4 files are 540p re-encodes cut from the originals
 * in web_assets/videos (source files untouched):
 *   standing-fish-web.mp4  ← "Post 1- Standing Fish" (full)
 *   wagyu-pho-web.mp4      ← "#3 - If you love x, you'll love y" (5s–18s)
 *   bo-nuong-web.mp4       ← "#1 - Must Try Menu Guide" (0s–31s)
 * They carry baked-in Thai subtitles; treat as placeholder cuts until
 * English/clean versions are provided.
 */
type DishAtmosphere = "fish" | "pho" | "bo" | "crepes";

type Dish = {
  name: string;
  story: string;
  photos: string[];
  video?: string;
  videoCaption?: string;
  atmosphere: DishAtmosphere;
};

const DISH_GROUND_VAR: Record<DishAtmosphere, string> = {
  fish: "--color-dish-fish-blue",
  pho: "--color-dish-pho-gold",
  bo: "--color-dish-burgundy",
  crepes: "--color-dish-crepe-cream",
};

function readDishGroundColors(): Record<DishAtmosphere, string> {
  const root = getComputedStyle(document.documentElement);
  return (Object.keys(DISH_GROUND_VAR) as DishAtmosphere[]).reduce(
    (acc, key) => {
      acc[key] = root.getPropertyValue(DISH_GROUND_VAR[key]).trim();
      return acc;
    },
    {} as Record<DishAtmosphere, string>,
  );
}

const DISHES: Dish[] = [
  {
    name: "Standing Fish",
    story:
      "A whole fish prepared in traditional Vietnamese style, served with fresh herbs, vegetables, and dipping sauce.",
    photos: ["/web_assets/Food/Copy of Le Dalat_20Oct20257623.jpg"],
    video: "/web_assets/videos/standing-fish-web.mp4",
    videoCaption: "The standing fish, arriving table-side",
    atmosphere: "fish",
  },
  {
    name: "Wagyu Pho",
    story:
      "Vietnam’s iconic noodle soup, featuring a slow-simmered aromatic broth, rice noodles, fresh herbs, and premium Wagyu beef.",
    photos: ["/web_assets/Food/Copy of Le Dalat_20Oct20256572.jpg"],
    video: "/web_assets/videos/wagyu-pho-web.mp4",
    videoCaption: "Wagyu pho, at the table",
    atmosphere: "pho",
  },
  {
    name: "Bò Nướng",
    story:
      "Traditional Vietnamese grilled beef, marinated with fragrant spices and chargrilled for a smoky, savory flavor.",
    photos: ["/web_assets/Food/Copy of Le Dalat_20Oct20250012.jpg"],
    video: "/web_assets/videos/bo-nuong-web.mp4",
    videoCaption: "Bò nướng, over the coals",
    atmosphere: "bo",
  },
  {
    name: "Vietnamese Crêpes (Bánh Xèo)",
    story:
      "A crispy turmeric-infused rice crêpe filled with shrimp, pork, and bean sprouts, wrapped in fresh herbs and dipped in fish sauce.",
    photos: [
      "/web_assets/Food/Copy of LeDalat_Jan91028 3.jpg",
      "/web_assets/Food/Copy of LeDalat_Jan91033 3.JPG",
    ],
    atmosphere: "crepes",
  },
];

function DishLotusMark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="size-2.5 shrink-0 text-gold/35"
      fill="none"
    >
      <path
        d="M8 11.5c-2.2-3.2-5.5-4.5-5.5-7.2 0 2.4 2.1 4 5.5 5.5 3.4-1.5 5.5-3.1 5.5-5.5 0 2.7-3.3 4-5.5 7.2z"
        stroke="currentColor"
        strokeWidth="0.65"
      />
      <path d="M8 12.2V8.8M6.2 7.8c-.6-2.6.3-4.7 1.8-5.5M9.8 7.8c.6-2.6-.3-4.7-1.8-5.5" stroke="currentColor" strokeWidth="0.5" />
    </svg>
  );
}

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
      const ground = scope.current?.querySelector<HTMLElement>("[data-dish-ground]");
      const deck = scope.current?.querySelector<HTMLElement>("[data-dish-deck]");
      if (!ground || !deck) return;

      // Discrete ground: the color belongs to the active dish and steps
      // with it at the crossfade midpoint (a short CSS transition on the
      // ground element carries the step; no scroll-linked lerp).
      const scrubDishGround = (progress: number) => {
        const colors = readDishGroundColors();
        const idx = Math.min(
          slides.length - 1,
          Math.round(progress * (slides.length - 1)),
        );
        const onCrepes = idx === slides.length - 1;
        deck.toggleAttribute("data-last-dish", onCrepes);
        deck.toggleAttribute("data-crepe-melt", onCrepes);
        const key = slides[idx].dataset.dishAtmosphere as DishAtmosphere;
        ground.style.setProperty("--dish-ground", colors[key]);
      };

      gsap.set("[data-dish-dashes]", { display: "flex" });
      gsap.set("[data-dish-slide]", { backgroundColor: "transparent" });
      scrubDishGround(0);
      slides.forEach((slide, i) => {
        gsap.set(slide, { zIndex: i === 0 ? 2 : 1, autoAlpha: i === 0 ? 1 : 0 });
      });

      // Discrete deck: scroll position only SELECTS a dish — each dish
      // owns an equal share of the pinned distance, and crossing a
      // boundary plays a quick fixed-clock crossfade. The scroll is never
      // written to (no snap tween), so it cannot fight Lenis, and no
      // scroll position can rest half-faded between two dishes.
      let activeIdx = 0;
      const showDish = (idx: number) => {
        if (idx === activeIdx) return;
        const from = slides[activeIdx];
        const to = slides[idx];
        activeIdx = idx;
        gsap.set(to, { zIndex: 2 });
        gsap.set(from, { zIndex: 1 });
        gsap.to(from, {
          autoAlpha: 0,
          duration: 0.28,
          ease: "power1.in",
          overwrite: "auto",
        });
        gsap.to(to, {
          autoAlpha: 1,
          duration: 0.32,
          ease: "power1.out",
          overwrite: "auto",
        });
      };

      ScrollTrigger.create({
        trigger: "[data-dish-deck]",
        start: "top top",
        end: () => "+=" + (slides.length - 1) * window.innerHeight,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          scrubDishGround(self.progress);
          const idx = Math.min(
            slides.length - 1,
            Math.round(self.progress * (slides.length - 1)),
          );
          dashes.forEach((d, i) => d.classList.toggle("is-active", i === idx));
          showDish(idx);
        },
      });
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={scope} id="dishes" aria-label="The signature dishes" className="dishes-scene">
      <div
        data-dishes-head
        className="dishes-scene__head relative z-[2] pt-28 pb-[calc(4rem+var(--scene-edge-blend))] sm:pt-40 sm:pb-[calc(6rem+var(--scene-edge-blend))]"
      >
        <div className="mx-auto max-w-2xl px-6 sm:text-center">
          <p className="eyebrow">III &middot; The Signature Dishes</p>
          <h2 className="mt-6 font-serif text-[clamp(2.25rem,9.5vw,2.75rem)] leading-[1.12] text-balance text-parchment sm:text-5xl sm:leading-tight">
            Four signature dishes.{" "}
            <em className="text-clay">One enduring tradition.</em>
          </h2>
        </div>
      </div>

      <div className="dishes-scene__tail">
      <div data-dish-deck className="relative z-[2] overflow-hidden">
        <div data-dish-ground aria-hidden className="absolute inset-0 z-0" />
        {DISHES.map((dish) => (
          <article
            key={dish.name}
            data-dish-slide
            data-dish-atmosphere={dish.atmosphere}
            className="relative z-[1] w-full py-8 sm:py-0"
          >
            <div className="relative z-[1] mx-auto grid w-full max-w-7xl gap-7 px-6 sm:grid-cols-[0.75fr_1.25fr] sm:items-center sm:gap-10">
              <div>
                <h3 className="font-serif text-3xl text-parchment sm:text-4xl">
                  {dish.name}
                </h3>
                <div aria-hidden className="dish-title-rule">
                  <span className="dish-title-rule__line" />
                  <DishLotusMark />
                  <span className="dish-title-rule__line dish-title-rule__line--tail" />
                </div>
                <p className="mt-4 max-w-prose font-serif text-lg italic leading-relaxed text-cream/85 sm:text-xl">
                  {dish.story}
                </p>
              </div>
              <div className="flex items-start justify-center gap-3 sm:justify-end sm:gap-6">
                {dish.video && (
                  <figure className="shrink-0">
                    <div className="dish-media-frame relative aspect-[9/16] h-[min(34svh,17.5rem)] overflow-hidden rounded-2xl sm:h-[min(64svh,40rem)] sm:rounded-3xl">
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
                      <figcaption className="sr-only">{dish.videoCaption}</figcaption>
                    )}
                  </figure>
                )}
                {dish.photos.map((photo) => (
                  <div
                    key={photo}
                    className={`dish-media-frame relative overflow-hidden rounded-2xl sm:rounded-3xl ${
                      dish.video
                        ? "h-[min(34svh,17.5rem)] min-w-0 flex-1 sm:h-[min(64svh,40rem)]"
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

        <div
          data-dish-dashes
          className="absolute bottom-7 left-1/2 z-[2] hidden -translate-x-1/2 gap-2.5"
          aria-hidden
        >
          {DISHES.map((dish) => (
            <span key={dish.name} data-dish-dash className="h-0.5 w-8" />
          ))}
        </div>
      </div>

      <div className="dishes-scene__fade-zone">
        <div className="dishes-scene__outro">
          <div
            data-dishes-menu-link
            className="dishes-scene__menu flex min-h-[var(--dishes-menu-block)] flex-col items-center justify-center px-6 py-12 sm:py-16 sm:text-center"
          >
            <Link
              href="/menu"
              className="dishes-scene__menu-link inline-flex min-h-11 w-full max-w-md items-center justify-center gap-3 font-sans text-[0.6875rem] tracking-[0.25em] uppercase sm:max-w-none sm:w-auto"
            >
              <span
                aria-hidden
                className="dishes-scene__menu-link__rule h-px min-w-8 flex-1 sm:w-10 sm:flex-none"
              />
              <span className="dishes-scene__menu-link__label shrink-0">
                The full menu
              </span>
              <span
                aria-hidden
                className="dishes-scene__menu-link__rule h-px min-w-8 flex-1 sm:w-10 sm:flex-none"
              />
            </Link>
          </div>
        </div>
        <div className="dishes-scene__fade-run" aria-hidden />
      </div>
      </div>
    </section>
  );
}
