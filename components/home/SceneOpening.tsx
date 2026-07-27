"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*
 * Swappable image slots — recast from the photo bank by changing one line.
 * (Gate shots carry their own medallion, so they live in stage 2 where no
 * logo overlays them.)
 */
const HERO_IMAGE =
  "/web_assets/Interor+exterior/Copy of Le Dalat_20Oct20250002.JPG";
const THRESHOLD_IMAGE =
  "/web_assets/Interor+exterior/Copy of Le Dalat_20Oct20253072.jpg";

/**
 * Scenes 1 + 2 — Arrival and The threshold (design_brief.md §3).
 * One pinned stage: the villa holds the viewport, then scroll CROSSFADES
 * it into the gates — no scrolling boundary between the two full-bleed
 * images (user direction). The persistent header floats above both.
 * Under prefers-reduced-motion the stage degrades to two plain stacked
 * full-viewport sections.
 */
export default function SceneOpening() {
  const scope = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      // Load-in: the villa breathes out, the words settle
      gsap
        .timeline({ defaults: { ease: "power2.out" } })
        .from("[data-arrival-wordmark]", { autoAlpha: 0, y: 28, duration: 2.0 })
        .from(
          "[data-arrival-line]",
          { autoAlpha: 0, y: 16, duration: 1.6 },
          "-=1.2",
        )
        .from("[data-open-header]", { autoAlpha: 0, duration: 1.4 }, "-=1.2")
        .from("[data-arrival-cue]", { autoAlpha: 0, duration: 1.4 }, "-=0.8");

      gsap.from("[data-arrival-zoom]", {
        scale: 1.08,
        duration: 2.6,
        ease: "power2.out",
      });

      // Pin the stage and crossfade villa → gates
      gsap.set(scope.current, { height: "100svh" });
      gsap.set("[data-open-stage1], [data-open-stage2]", {
        position: "absolute",
        inset: 0,
      });
      // Explicit z-order: stage 2 must cover stage 1's z-indexed text
      gsap.set("[data-open-stage1]", { zIndex: 1 });
      gsap.set("[data-open-stage2]", { autoAlpha: 0, zIndex: 2 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: scope.current,
            start: "top top",
            end: () => "+=" + window.innerHeight * 1.3,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
        .to({}, { duration: 0.3 }) // dwell on the villa
        .to(
          "[data-arrival-wordmark], [data-arrival-line], [data-arrival-cue]",
          { autoAlpha: 0, duration: 0.3, ease: "none" },
        )
        .to(
          "[data-open-stage2]",
          { autoAlpha: 1, duration: 0.45, ease: "none" },
          "-=0.15",
        )
        .fromTo(
          "[data-threshold-image]",
          { scale: 1.1 },
          { scale: 1, duration: 0.6, ease: "none" },
          "<",
        )
        .from(
          "[data-threshold-copy] > *",
          { autoAlpha: 0, y: 26, duration: 0.3, stagger: 0.08 },
          "-=0.2",
        )
        .to({}, { duration: 0.25 }); // dwell on the gates
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={scope}
      className="relative"
      aria-label="Arrival and the threshold"
    >
      {/* Stage 1 — Arrival: the villa, the name, one whispered line */}
      <div
        data-open-stage1
        className="relative flex min-h-svh flex-col overflow-hidden bg-navy-deep"
      >
        <div
          data-arrival-zoom
          aria-hidden
          className="absolute inset-0 will-change-transform"
        >
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(6,14,28,0.47)_0%,rgba(6,14,28,0.17)_38%,rgba(6,14,28,0.29)_62%,rgba(6,14,28,0.5)_100%)]"
        />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-16 text-center">
          <h1
            data-arrival-wordmark
            className="font-serif text-[clamp(3.25rem,11vw,7.5rem)] leading-none tracking-[0.1em] uppercase text-parchment"
          >
            Le Dalat
          </h1>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8 pb-8">
          {/* Soi 23 and 1983 are documented facts (CLAUDE.md); the phrasing is ours */}
          <p
            data-arrival-line
            className="max-w-md px-6 font-serif text-lg italic text-cream/90 sm:max-w-none sm:text-xl"
          >
            a hidden garden on Sukhumvit Soi 23, since 1983
          </p>
          <div data-arrival-cue className="flex flex-col items-center gap-3">
            <span className="font-sans text-[0.625rem] tracking-[0.3em] uppercase text-cream/60">
              Enter
            </span>
            <span aria-hidden className="h-10 w-px bg-gold/60" />
          </div>
        </div>
      </div>

      {/* Stage 2 — The threshold: the gates surface over the villa */}
      <div
        data-open-stage2
        className="relative flex min-h-svh items-center justify-center overflow-hidden bg-navy-deep"
      >
        <div
          data-threshold-image
          aria-hidden
          className="absolute inset-0 will-change-transform"
        >
          <Image
            src={THRESHOLD_IMAGE}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        {/* Bottom lands on navy-deep for the scroll-out into scene 3 */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(6,14,28,0.3)_0%,rgba(6,14,28,0.25)_28%,rgba(6,14,28,0.35)_55%,rgba(6,14,28,0.6)_80%,var(--color-navy-deep)_100%)]"
        />

        <div
          data-threshold-copy
          className="relative z-10 max-w-xl px-6 text-center"
        >
          <h2 className="font-serif text-4xl leading-tight text-parchment sm:text-6xl">
            You have left Bangkok.
          </h2>
          {/* Green gates, wooden house, garden, Soi 23 — documented facts; phrasing is ours */}
          <p className="mt-6 font-serif text-lg italic leading-relaxed text-cream/90 sm:text-xl">
            Behind the green gates, a wooden house and its garden keep their
            own time.
          </p>
        </div>
      </div>

      {/* Persistent header — floats above both stages (design_brief.md §5) */}
      <header
        data-open-header
        className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 pt-5 sm:px-10 sm:pt-7"
      >
        <Link
          href="/"
          className="inline-flex min-h-11 items-center"
          aria-label="Le Dalat — home"
        >
          <Image
            src="/web_assets/LD-logo-crop.svg"
            alt="Le Dalat"
            width={200}
            height={200}
            priority
            className="h-auto w-12 sm:w-14"
          />
        </Link>
        <Link
          href="/reservation"
          className="inline-flex min-h-11 items-center border border-gold/40 px-5 font-sans text-[0.6875rem] tracking-[0.25em] uppercase text-gold transition-colors duration-500 hover:border-gold hover:text-parchment"
        >
          Reserve
        </Link>
      </header>
    </section>
  );
}
