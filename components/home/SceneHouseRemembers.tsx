"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scene 3 — The house remembers (design_brief.md §3, scene 3).
 * The animation budget is spent here: a vertical timeline whose dates enter
 * as the visitor reaches them. Weighted and unhurried, nothing bouncy.
 *
 * The melt (§2) happens across this section: the ground travels from act-one
 * navy into midnight jade (user direction, evolving the brief's brown) as a
 * static gradient painted on the section — the
 * transition is scroll-linked by geometry, works identically with reduced
 * motion, and costs no JS.
 */

/*
 * Heritage timeline — editorial copy; dates reflect the family narrative
 * as provided for the public site.
 *
 * The photographs are the family's own archive. Their captions are the
 * family's wording, carried over from the framing list rather than written
 * here — PLACEHOLDER until the family approves them for the public site,
 * like all story content. The prints are not cropped: each keeps the shape
 * it was scanned at, because an archive is not a grid.
 */
const TIMELINE = [
  {
    date: "1926",
    copy: "The family matriarch established the wealthy Mekong Delta culinary traditions and helped found the Cao Dai religion in French colonial Vietnam.",
    photo: {
      src: "/web_assets/heritage/hoa-ly-with-her-mother.jpg",
      width: 990,
      height: 1400,
      alt: "Madame Hoa Ly as a young woman, standing beside her seated mother, both in embroidered ao dai",
      caption: "Madame Hoa Ly at sixteen with her mother, Madame Huynh Ngoc Ho",
    },
  },
  {
    date: "1983",
    copy: "Madame Hoa Ly opened Le Dalat on Sukhumvit Soi 23 as Bangkok’s pioneer upscale Vietnamese restaurant.",
    photo: {
      src: "/web_assets/heritage/hoa-ly-da-lat-1938.jpg",
      width: 1400,
      height: 1078,
      alt: "Madame Hoa Ly in ao dai holding an armful of blossom beside a 1938 Buick Century, in Da Lat",
      caption: "Da Lat, 1938 — the resort that would give the restaurant its name",
    },
  },
  {
    date: "2009",
    copy: "The restaurant relocated within the same street into a reconstructed, authentic 1896 wooden farmhouse imported from Vietnam.",
    photo: {
      // Copied into heritage/ rather than referenced in place: the
      // "Interor+exterior" folder's "+" is decoded as a space by the local
      // image optimizer, so those paths 400 under `next start` even though
      // Vercel serves them. A clean name keeps this verifiable offline.
      src: "/web_assets/heritage/villa-photograph-wall.jpg",
      width: 1280,
      height: 1600,
      alt: "A brick wall inside the villa hung densely with framed family photographs, above a carved settee and blue-and-white porcelain",
      caption: "The farmhouse walls, where the family hung its photographs",
    },
  },
  {
    date: "Today",
    copy: "The third generation of the family continues to run the legendary dining institution using directly imported Vietnamese ingredients.",
    invitation: true,
  },
];

export default function SceneHouseRemembers() {
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-house-head] > *", {
        autoAlpha: 0,
        y: 32,
        duration: 1.4,
        ease: "power2.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: "[data-house-head]",
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      // The rail draws itself down as the visitor descends
      gsap.from("[data-house-rail]", {
        scaleY: 0,
        transformOrigin: "top center",
        ease: "none",
        scrollTrigger: {
          trigger: "[data-house-timeline]",
          start: "top 70%",
          end: "bottom 75%",
          scrub: true,
        },
      });

      gsap.utils
        .toArray<HTMLElement>("[data-house-entry]")
        .forEach((entry) => {
          gsap
            .timeline({
              defaults: { ease: "power2.out" },
              scrollTrigger: {
                trigger: entry,
                start: "top 72%",
                toggleActions: "play none none reverse",
              },
            })
            .from(entry.querySelector("[data-entry-dot]"), {
              scale: 0,
              duration: 0.8,
            })
            .from(
              entry.querySelector("[data-entry-date]"),
              { autoAlpha: 0, y: 28, duration: 1.2 },
              "-=0.5",
            )
            .from(
              entry.querySelector("[data-entry-copy]"),
              { autoAlpha: 0, y: 24, duration: 1.2 },
              "-=0.8",
            );

          // The photograph surfaces last and slowest — a print set down,
          // not a card dealt. Entries without one simply skip this.
          const print = entry.querySelector("[data-entry-photo]");
          if (print) {
            gsap.from(print, {
              autoAlpha: 0,
              y: 20,
              duration: 1.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: print,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            });
          }
        });
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={scope}
      id="heritage"
      aria-label="The house remembers"
      className="house-scene px-6 pt-28 pb-[calc(7rem+var(--scene-edge-blend))] sm:pt-40 sm:pb-[calc(10rem+var(--scene-edge-blend))]"
    >
      <div className="relative z-[1] mx-auto max-w-2xl">
        <div data-house-head>
          <p className="eyebrow">II &middot; The House Remembers</p>
          <h2 className="mt-6 font-serif text-[clamp(2.5rem,10.5vw,3rem)] leading-[1.12] text-balance text-parchment sm:text-5xl sm:leading-tight">
            Madame Hoa Ly welcomed her first guests in 1983.{" "}
            <em className="text-clay">The table has been waiting ever since.</em>
          </h2>
        </div>

        <div data-house-timeline className="relative mt-20 sm:mt-28">
          <div
            data-house-rail
            aria-hidden
            className="absolute top-2 bottom-2 left-[3px] w-px bg-gold/40"
          />

          <ol className="space-y-20 sm:space-y-28">
            {TIMELINE.map((entry) => (
              <li
                key={entry.date}
                data-house-entry
                className="relative pl-7 sm:pl-14"
              >
                <span
                  data-entry-dot
                  aria-hidden
                  className="absolute top-3 left-0 h-[7px] w-[7px] rounded-full bg-gold"
                />
                <h3
                  data-entry-date
                  className="font-serif text-3xl text-gold sm:text-4xl"
                >
                  {entry.date}
                </h3>
                <div data-entry-copy>
                  <p className="mt-4 max-w-prose text-base leading-relaxed text-cream/85 sm:text-lg">
                    {entry.copy}
                  </p>
                  {entry.photo && (
                    <figure data-entry-photo className="mt-8">
                      {/* A hung print: gold hairline, its own shape kept */}
                      <Image
                        src={entry.photo.src}
                        alt={entry.photo.alt}
                        width={entry.photo.width}
                        height={entry.photo.height}
                        sizes="(min-width: 640px) 20rem, 70vw"
                        className="h-auto w-full max-w-[14rem] rounded-sm ring-1 ring-gold/30 sm:max-w-[18rem]"
                      />
                      <figcaption className="mt-3 max-w-[14rem] font-sans text-[0.625rem] leading-relaxed tracking-[0.2em] uppercase text-cream/60 sm:max-w-[18rem]">
                        {entry.photo.caption}
                      </figcaption>
                    </figure>
                  )}
                  {entry.invitation && (
                    <p className="mt-6 font-serif text-lg italic text-cream">
                      The evening is waiting.{" "}
                      <Link
                        href="/reservation"
                        className="inline-block py-2 -my-2 text-gold underline decoration-gold/40 underline-offset-4 transition-colors duration-500 hover:text-parchment hover:decoration-parchment/40"
                      >
                        Reserve your evening
                      </Link>
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
