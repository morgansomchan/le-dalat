"use client";

import { useEffect, useRef, useState } from "react";
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
 * Practical details all confirmed (Aug 2026): address, telephone, hours
 * (lunch 11:30–14:30, dinner 17:30–22:00; bookable to 13:30 / 21:30) and
 * the social links.
 */
export default function SceneNightGarden() {
  const scope = useRef<HTMLElement>(null);
  const [evening, setEvening] = useState("");
  const [guests, setGuests] = useState("2");

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-night-kb]",
        { scale: 1 },
        {
          scale: 1.2,
          duration: 8,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 0.3,
        },
      );

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
      id="night-garden"
      aria-label="Night, in the garden"
      className="night-garden-scene relative bg-transparent"
    >
      {/* The set table glows through a heavy candlelit scrim. The photo is
          clipped by its own wrapper; the handoff and scrim live OUTSIDE it
          so their unclipped edges can cover the photo's antialiased clip
          edge (a hairline seam against the brighter People ground). */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div
          data-night-kb
          className="absolute inset-0 will-change-transform"
        >
          <Image
            src={NIGHT_IMAGE}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>
      {/* The hope curve: teak haze clears slowly at the top (no hard photo
          edge against scene 5), then the scrim thins toward the bottom —
          the page ends on the table at its brightest (user direction) */}
      <div className="night-garden-scene__handoff" aria-hidden />
      <div className="night-garden-scene__scrim" aria-hidden />

      <div className="night-garden-scene__content relative z-10 mx-auto flex min-h-svh max-w-2xl flex-col items-center justify-start px-6 pb-28 text-center sm:pb-36">
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
        <form action="/reservation" lang="en-US" className="reserve-widget">
          <div className="flex flex-col gap-8 sm:flex-row sm:gap-6">
            <label className="min-w-0 flex-1 text-left">
              <span className="font-sans text-[0.625rem] tracking-[0.25em] uppercase text-gold">
                Evening
              </span>
              <div className="reserve-field-wrap reserve-field-wrap--date mt-3">
                <input
                  type="date"
                  name="date"
                  lang="en-US"
                  value={evening}
                  onChange={(e) => setEvening(e.target.value)}
                  className={`reserve-field reserve-field--date [color-scheme:dark] ${
                    evening ? "" : "reserve-field--date-empty"
                  }`}
                />
                {!evening && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-4 flex items-center font-serif text-base italic text-cream/42"
                  >
                    Choose a date
                  </span>
                )}
              </div>
            </label>
            <label className="min-w-0 flex-1 text-left">
              <span className="font-sans text-[0.625rem] tracking-[0.25em] uppercase text-gold">
                Guests
              </span>
              <div className="reserve-field-wrap mt-3">
                <select
                  name="guests"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="reserve-field reserve-field--guests"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "guest" : "guests"}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>
          <button
            type="submit"
            className="btn-reserve-glow mt-6 inline-flex min-h-11 w-full items-center justify-center border border-gold/50 px-5 font-sans text-[0.6875rem] tracking-[0.25em] uppercase text-gold transition-colors duration-500 hover:border-gold hover:bg-gold/10 hover:text-parchment"
          >
            Reserve
          </button>
        </form>

        {/* Practical details — confirmed Aug 2026 */}
        <div className="mt-7 grid grid-cols-1 gap-6 border-t border-gold/15 pt-6 text-center sm:grid-cols-3">
          <div>
            <p className="font-sans text-[0.625rem] tracking-[0.25em] uppercase text-gold/80">
              Find us
            </p>
            <p className="mt-2 font-sans text-xs leading-relaxed text-cream/75">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Le+Dalat+57+Soi+Sukhumvit+23+Bangkok"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-cream"
              >
                57 Soi Sukhumvit 23
              </a>
              <span className="block text-cream/35">
                Khlong Toei Nuea, Watthana, Bangkok 10110
              </span>
            </p>
          </div>
          <div>
            <p className="font-sans text-[0.625rem] tracking-[0.25em] uppercase text-gold/80">
              Call
            </p>
            <p className="mt-2 font-sans text-xs leading-relaxed text-cream/75">
              <a href="tel:+6622599593" className="transition-colors hover:text-cream">
                +66 2 259 9593
              </a>
              <span className="block text-cream/35">02 259 9593 within Thailand</span>
            </p>
          </div>
          <div>
            <p className="font-sans text-[0.625rem] tracking-[0.25em] uppercase text-gold/80">
              Hours
            </p>
            <p className="mt-2 font-sans text-xs leading-relaxed text-cream/75">
              Lunch 11:30 am &ndash; 2:30 pm
              <span className="block">Dinner 5:30 &ndash; 10:00 pm</span>
              <span className="block text-cream/35">
                Last booking 1:30 pm &middot; 9:30 pm
              </span>
            </p>
          </div>
        </div>

        <p className="mt-7 text-center font-sans text-[0.6875rem] tracking-[0.2em] uppercase text-cream/70">
          Join the family &mdash;{" "}
          <a
            href="https://www.facebook.com/ledalatrestaurant"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold underline decoration-gold/40 underline-offset-4 transition-colors duration-500 hover:text-parchment"
          >
            Facebook
          </a>{" "}
          &middot;{" "}
          <a
            href="https://page.line.me/ysn7495x"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold underline decoration-gold/40 underline-offset-4 transition-colors duration-500 hover:text-parchment"
          >
            LINE
          </a>{" "}
          &middot;{" "}
          <a
            href="https://www.instagram.com/ledalatrestaurant/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold underline decoration-gold/40 underline-offset-4 transition-colors duration-500 hover:text-parchment"
          >
            Instagram
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
