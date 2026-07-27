"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scene 5 — The people of the house (design_brief.md §3, scene 5).
 * A large group photograph first — the whole house together — then five
 * portraits in arched frames echoing the villa's moon-gate window.
 * Warm, human, slightly mischievous.
 * Ground travels royal (from scene 4) back into act-two brown.
 */

/*
 * PLACEHOLDER CONTENT — every label is placeholder: role labels from the
 * earlier prototype are known to be wrong, so labels only describe what
 * the photograph shows, never a name, title or family relation. Photos
 * swappable from web_assets/"People of Le Dalat".
 */
const PLACEHOLDER_TAG = "[PLACEHOLDER — name & role pending]";

const GROUP_PHOTO = {
  photo: "/web_assets/People of Le Dalat/Copy of Le Dalat_20Oct20250332.jpg",
  caption: "The house, assembled",
};

const PEOPLE = [
  {
    photo: "/web_assets/People of Le Dalat/Copy of LeDalat_Jan93084.jpg",
    label: "At the set table",
  },
  {
    photo: "/web_assets/People of Le Dalat/Copy of LeDalat_Jan91039 3.jpg",
    label: "At the garden window",
  },
  {
    photo: "/web_assets/People of Le Dalat/Copy of LeDalat_Jan93109.jpg",
    label: "At the bar",
  },
  {
    photo: "/web_assets/People of Le Dalat/Copy of LeDalat_Jan92064.jpg",
    label: "Service, with slight mischief",
  },
  {
    photo: "/web_assets/People of Le Dalat/Copy of LeDalat_Jan91041 1.jpg",
    label: "Dinner, carried",
  },
];

export default function ScenePeople() {
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-people-head] > *", {
        autoAlpha: 0,
        y: 32,
        duration: 1.4,
        ease: "power2.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: "[data-people-head]",
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from("[data-people-group]", {
        autoAlpha: 0,
        y: 44,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "[data-people-group]",
          start: "top 78%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from("[data-people-portrait]", {
        autoAlpha: 0,
        y: 48,
        duration: 1.5,
        ease: "power2.out",
        stagger: 0.16,
        scrollTrigger: {
          trigger: "[data-people-grid]",
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={scope}
      aria-label="The people of the house"
      className="bg-[linear-gradient(to_bottom,var(--color-royal)_0%,var(--color-umber)_32%,var(--color-teak)_100%)] px-6 py-28 sm:py-40"
    >
      <div className="mx-auto max-w-6xl">
        <div data-people-head className="mx-auto max-w-2xl sm:text-center">
          <p className="eyebrow">IV &middot; The People of the House</p>
          {/* Voice reference from the brief; "three generations" awaits approval */}
          <h2 className="mt-6 font-serif text-[clamp(2.25rem,9.5vw,2.75rem)] leading-[1.12] text-balance text-parchment sm:text-5xl sm:leading-tight">
            Three generations will say{" "}
            <em className="text-clay">good evening.</em>
          </h2>
          <p className="mt-4 font-sans text-[0.625rem] tracking-[0.2em] uppercase text-gold/60">
            Placeholder — needs family approval
          </p>
        </div>

        {/* The whole house together, in front of the photograph wall */}
        <figure data-people-group className="mx-auto mt-16 max-w-3xl sm:mt-24">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-[0_18px_50px_-12px_rgba(0,0,0,0.5)] sm:rounded-3xl">
            <Image
              src={GROUP_PHOTO.photo}
              alt={GROUP_PHOTO.caption}
              fill
              sizes="(min-width: 640px) 48rem, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-4 text-center">
            <span className="font-sans text-[0.6875rem] tracking-[0.25em] uppercase text-cream/70">
              {GROUP_PHOTO.caption}
            </span>
            <span className="mt-1 block font-sans text-[0.5625rem] tracking-[0.15em] uppercase text-cream/35">
              [PLACEHOLDER — who is who awaits the family]
            </span>
          </figcaption>
        </figure>

        <div
          data-people-grid
          className="mt-20 grid gap-12 sm:mt-28 sm:grid-cols-5 sm:gap-6"
        >
          {PEOPLE.map((person) => (
            <figure
              key={person.photo}
              data-people-portrait
              className="mx-auto w-full max-w-[16rem] sm:max-w-none"
            >
              {/* Moon-gate arch: full-round top echoing the villa's window */}
              <div className="relative aspect-[7/10] overflow-hidden rounded-t-full ring-1 ring-gold/30">
                <Image
                  src={person.photo}
                  alt={person.label}
                  fill
                  sizes="(min-width: 640px) 20vw, 65vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-4 text-center">
                <span className="font-sans text-[0.625rem] tracking-[0.2em] uppercase text-cream/80">
                  {person.label}
                </span>
                <span className="mt-1 block font-sans text-[0.5625rem] tracking-[0.12em] uppercase text-cream/35">
                  {PLACEHOLDER_TAG}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
