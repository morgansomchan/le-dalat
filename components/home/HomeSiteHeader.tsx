"use client";

import { useCallback, useEffect, useId, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const NAV_SECTIONS = [
  { id: "heritage", label: "The history" },
  { id: "dishes", label: "Signature dishes" },
  { id: "people", label: "The staff" },
  { id: "night-garden", label: "Reservation" },
] as const;

/** Clearance for the fixed site header */
const NAV_SCROLL_OFFSET = -88;
const NAV_SCROLL_DURATION = 2.1;

/** Gentle ease-in-out — unhurried handoff between sections */
function navScrollEase(t: number) {
  return t * t * (3 - 2 * t);
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  const reduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reduced) {
    const top =
      el.getBoundingClientRect().top + window.scrollY + NAV_SCROLL_OFFSET;
    window.scrollTo({ top, behavior: "auto" });
    ScrollTrigger.update();
    return;
  }

  const lenis = window.__lenis;

  if (lenis) {
    lenis.start();
    lenis.scrollTo(el, {
      offset: NAV_SCROLL_OFFSET,
      duration: NAV_SCROLL_DURATION,
      easing: navScrollEase,
      lerp: 0.075,
      force: true,
      programmatic: true,
      onComplete: () => ScrollTrigger.update(),
    });
    return;
  }

  const top =
    el.getBoundingClientRect().top + window.scrollY + NAV_SCROLL_OFFSET;
  window.scrollTo({ top, behavior: "smooth" });
}

export default function HomeSiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const panelId = useId();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const navigateToSection = useCallback(
    (id: string) => {
      closeMenu();
      window.setTimeout(() => scrollToSection(id), 240);
    },
    [closeMenu],
  );

  useEffect(() => {
    gsap.from("[data-site-header]", {
      autoAlpha: 0,
      duration: 1.4,
      ease: "power2.out",
      delay: 0.35,
    });
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const lenis = window.__lenis;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        data-site-header
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 pt-5 sm:px-10 sm:pt-7"
      >
        <button
          type="button"
          className="nav-menu-btn pointer-events-auto inline-flex min-h-11 min-w-11 appearance-none items-center justify-center"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls={panelId}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span
            className="nav-menu-btn__lines flex w-7 flex-col items-start gap-[6px]"
            aria-hidden
          >
            <span className="h-px w-7 bg-gold" />
            <span className="h-px w-7 bg-gold" />
            <span className="h-px w-7 bg-gold" />
          </span>
        </button>
        <Link
          href="/reservation"
          className="btn-reserve-glow pointer-events-auto inline-flex min-h-11 items-center border border-gold/40 px-5 font-sans text-[0.6875rem] tracking-[0.25em] uppercase text-gold transition-colors duration-500 hover:border-gold hover:text-parchment"
        >
          Reserve
        </Link>
      </header>

      <div
        className={`site-nav-backdrop fixed inset-0 z-[55] bg-navy-deep/75 backdrop-blur-[6px] transition-opacity duration-500 ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!menuOpen}
        onClick={closeMenu}
      />

      <nav
        id={panelId}
        aria-label="Site sections"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        className={`site-nav-panel fixed inset-y-0 left-0 z-[60] flex w-[min(100%,17.5rem)] max-w-[17.5rem] flex-col border-r border-cream/10 bg-[color-mix(in_srgb,var(--color-navy-deep)_92%,transparent)] px-6 pb-10 pt-24 shadow-[24px_0_80px_-20px_rgba(0,0,0,0.65)] backdrop-blur-md transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-7 sm:pt-28 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          tabIndex={menuOpen ? 0 : -1}
          className="site-nav-link site-nav-link--brand text-left"
          onClick={() => navigateToSection("arrival")}
        >
          <span className="font-sans text-[0.625rem] tracking-[0.35em] uppercase text-cream/50 transition-colors duration-500 hover:text-cream/80">
            Le Dalat
          </span>
        </button>
        <ul className="mt-10 flex flex-col gap-1">
          {NAV_SECTIONS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                tabIndex={menuOpen ? 0 : -1}
                className="site-nav-link group w-full py-3.5 text-left"
                onClick={() => navigateToSection(item.id)}
              >
                <span className="site-nav-link__label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-10 border-t border-cream/10 pt-6">
          <Link
            href="/menu"
            tabIndex={menuOpen ? 0 : -1}
            className="site-nav-link inline-flex min-h-11 items-center font-sans text-[0.6875rem] tracking-[0.25em] uppercase text-cream/75 transition-colors duration-500 hover:text-parchment"
            onClick={closeMenu}
          >
            The full menu
          </Link>
        </div>
      </nav>
    </>
  );
}
