"use client";

import { useEffect, useRef } from "react";
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
 * navy to act-two brown as a static gradient painted on the section — the
 * transition is scroll-linked by geometry, works identically with reduced
 * motion, and costs no JS.
 */

/*
 * Heritage timeline — editorial copy; dates reflect the family narrative
 * as provided for the public site.
 */
const TIMELINE = [
  {
    date: "1926",
    copy: "The family matriarch established the wealthy Mekong Delta culinary traditions and helped found the Cao Dai religion in French colonial Vietnam.",
  },
  {
    date: "1983",
    copy: "Madame Hoa Ly opened Le Dalat on Sukhumvit Soi 23 as Bangkok’s pioneer upscale Vietnamese restaurant.",
  },
  {
    date: "2009",
    copy: "The restaurant relocated within the same street into a reconstructed, authentic 1896 wooden farmhouse imported from Vietnam.",
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
