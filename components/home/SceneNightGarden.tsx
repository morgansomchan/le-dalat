"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*
 * Swappable image slot — the set table under the lotus lamp, at night.
 */
const NIGHT_IMAGE = "/web_assets/Food/Copy of Le Dalat_20Oct20255148.jpg";

/**
 * Scene 6 — Night, in the garden (design_brief.md §3, scene 6).
 * The finale in full dark brown: the story lands on a set table. The
 * reservation widget collects date and guest count ONLY and hands off to
 * /reservation with those values prefilled (a plain GET form — no booking
 * logic lives on the homepage). The page ends here.
 */

/*
 * PLACEHOLDER CONTENT — phone, hours, exact address and social links all
 * await confirmation (project_context.md: final hours and contact details
 * pending). Soi 23 and est. 1983 are documented.
 */
export default function SceneNightGarden() {
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-night-reveal]", {
        autoAlpha: 0,
        y: 36,
        duration: 1.5,
        ease: "power2.out",
        stagger: 0.18,
        scrollTrigger: {
          trigger: scope.current,
          start: "top 55%",
          toggleActions: "play none none reverse",
        },
      });
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={scope}
      aria-label="Night, in the garden"
      className="relative overflow-hidden bg-umber-deep"
    >
      {/* The set table glows through a heavy candlelit scrim */}
      <div aria-hidden className="absolute inset-0">
        <Image
          src={NIGHT_IMAGE}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        {/* The hope curve: teak haze clears slowly at the top (no hard photo
            edge against scene 5), then the scrim thins toward the bottom —
            the page ends on the table at its brightest (user direction) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(107,74,46,1)_0%,rgba(107,74,46,0.55)_12%,rgba(107,74,46,0.15)_28%,rgba(18,11,5,0.32)_52%,rgba(18,11,5,0.18)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-svh max-w-2xl flex-col items-center justify-center px-6 py-28 text-center sm:py-36">
        <p data-night-reveal className="eyebrow">
          V &middot; Night, in the Garden
        </p>
        <h2
          data-night-reveal
          className="mt-6 font-serif text-[clamp(2.25rem,9.5vw,2.75rem)] leading-[1.12] text-balance text-parchment sm:text-5xl sm:leading-tight"
        >
          Your table is <em className="text-clay">already lit.</em>
        </h2>
        <p
          data-night-reveal
          className="mt-5 max-w-md font-serif text-lg italic leading-relaxed text-cream/85"
        >
          The lamps are on, the porcelain is set. Choose an evening; the house
          will do the rest.
        </p>

        {/* One glass card: widget + practical details, so the text reads
            over the bright table without dimming the photo */}
        <div
          data-night-reveal
          className="mt-12 w-full max-w-md border border-gold/25 bg-black/30 p-6 backdrop-blur-sm sm:p-7"
        >
        {/* Visual-only widget: plain GET form → /reservation?date=…&guests=… */}
        <form action="/reservation">
          <div className="flex flex-col gap-4 sm:flex-row">
            <label className="flex-1 text-left">
              <span className="font-sans text-[0.625rem] tracking-[0.25em] uppercase text-gold">
                Evening
              </span>
              <input
                type="date"
                name="date"
                className="mt-2 w-full border border-cream/20 bg-transparent px-3 py-2.5 font-sans text-sm text-cream [color-scheme:dark] focus:border-gold/60 focus:outline-none"
              />
            </label>
            <label className="flex-1 text-left">
              <span className="font-sans text-[0.625rem] tracking-[0.25em] uppercase text-gold">
                Guests
              </span>
              <select
                name="guests"
                defaultValue="2"
                className="mt-2 w-full border border-cream/20 bg-transparent px-3 py-2.5 font-sans text-sm text-cream [color-scheme:dark] focus:border-gold/60 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n} className="bg-umber-deep">
                    {n} {n === 1 ? "guest" : "guests"}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="submit"
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center border border-gold/50 px-5 font-sans text-[0.6875rem] tracking-[0.25em] uppercase text-gold transition-colors duration-500 hover:border-gold hover:bg-gold/10 hover:text-parchment"
          >
            Reserve
          </button>
        </form>

        {/* Practical details — all PLACEHOLDER until confirmed */}
        <div className="mt-7 grid grid-cols-1 gap-6 border-t border-gold/15 pt-6 text-center sm:grid-cols-3">
          <div>
            <p className="font-sans text-[0.625rem] tracking-[0.25em] uppercase text-gold/80">
              Find us
            </p>
            <p className="mt-2 font-sans text-xs leading-relaxed text-cream/75">
              Sukhumvit Soi 23, Bangkok
              <span className="block text-cream/35">
                [exact address pending]
              </span>
            </p>
          </div>
          <div>
            <p className="font-sans text-[0.625rem] tracking-[0.25em] uppercase text-gold/80">
              Call
            </p>
            <p className="mt-2 font-sans text-xs leading-relaxed text-cream/75">
              +66 · —
              <span className="block text-cream/35">[number pending]</span>
            </p>
          </div>
          <div>
            <p className="font-sans text-[0.625rem] tracking-[0.25em] uppercase text-gold/80">
              Hours
            </p>
            <p className="mt-2 font-sans text-xs leading-relaxed text-cream/75">
              Lunch &amp; dinner
              <span className="block text-cream/35">[hours pending]</span>
            </p>
          </div>
        </div>

        {/* Family circle — links pending (PLACEHOLDER hrefs) */}
        <p className="mt-7 text-center font-sans text-[0.6875rem] tracking-[0.2em] uppercase text-cream/70">
          Join the family circle &mdash;{" "}
          <a
            href="#"
            className="text-gold underline decoration-gold/40 underline-offset-4 transition-colors duration-500 hover:text-parchment"
          >
            Facebook
          </a>{" "}
          &middot;{" "}
          <a
            href="#"
            className="text-gold underline decoration-gold/40 underline-offset-4 transition-colors duration-500 hover:text-parchment"
          >
            LINE
          </a>
        </p>
        </div>

        <div data-night-reveal className="mt-16 flex flex-col items-center gap-4">
          <Image
            src="/web_assets/LD-logo-crop.svg"
            alt="Le Dalat"
            width={200}
            height={200}
            className="h-auto w-14 opacity-80"
          />
          <p className="font-sans text-[0.625rem] tracking-[0.3em] uppercase text-cream/50">
            Le Dalat &middot; est. 1983
          </p>
        </div>
      </div>
    </section>
  );
}
