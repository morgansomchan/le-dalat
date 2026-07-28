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
 * navy into midnight jade (user direction, evolving the brief's brown) as a
 * static gradient painted on the section — the
 * transition is scroll-linked by geometry, works identically with reduced
 * motion, and costs no JS.
 */

/*
 * PLACEHOLDER CONTENT — deliberately generic: placeholder copy must not
 * invent facts (project_context.md "Content honesty"). Dates come from the
 * brief's timeline structure and are themselves unverified. Each entry
 * carries a visible [PLACEHOLDER] tag until the family approves the story.
 */
const PLACEHOLDER_TAG = " [PLACEHOLDER — needs family approval]";

const TIMELINE = [
  {
    date: "1926",
    copy: "The house before the restaurant — a line or two about this address in its earliest days, told the way the family tells it.",
  },
  {
    date: "1983",
    copy: "The founding — how the first table came to be set behind the green gates, and by whom.",
  },
  {
    date: "2009",
    copy: "The next generation — what changed hands in the kitchen, and what never will.",
  },
  {
    date: "Tonight",
    copy: "The lamps are lit, the tables are set — the story continues at dinner.",
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
      aria-label="The house remembers"
      className="relative bg-[linear-gradient(to_bottom,var(--color-navy-deep)_0%,var(--color-navy-deep)_10%,var(--color-jade-deep)_42%,var(--color-jade-deep)_100%)] px-6 py-28 sm:py-40"
    >
      <div className="mx-auto max-w-2xl">
        <div data-house-head>
          <p className="eyebrow">II &middot; The House Remembers</p>
          {/* PLACEHOLDER headline — the brief's voice reference; the name is unverified */}
          <h2 className="mt-6 font-serif text-[clamp(2.5rem,10.5vw,3rem)] leading-[1.12] text-balance text-parchment sm:text-5xl sm:leading-tight">
            Madame Hoa Ly set a table in 1983.{" "}
            <em className="text-clay">It has never been cleared.</em>
          </h2>
          <p className="mt-4 font-sans text-[0.625rem] tracking-[0.2em] uppercase text-gold/60">
            Placeholder — needs family approval
          </p>
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
                    <span className="text-cream/40">{PLACEHOLDER_TAG}</span>
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
