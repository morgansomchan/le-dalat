"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * The archive — a continuation of Scene II, not a scene of its own.
 *
 * It carries no numeral on purpose: the house remembering and the house's
 * photographs are one thought, and the brief's six scenes stay six. It also
 * lets `.house-scene` keep painting one percentage-based gradient over a
 * taller section, so the navy-to-emerald melt survives untouched.
 *
 * The prints are scattered rather than gridded — varied widths, a degree or
 * two of tilt, uneven vertical offsets — the way photographs actually hang
 * on the villa's wall. The tilt is decorative only; nothing reflows if it
 * is removed, and reduced motion drops the whole reveal.
 */

/*
 * PLACEHOLDER, like all story content: the captions are the family's own
 * wording, carried verbatim from the 2019 framing list rather than written
 * here. Trimmed only of the list's leading numbers.
 *
 * One pairing is NOT confirmed: the studio portrait below is matched to the
 * list's Bao Dai entry by subject, not by filename — the scans arrived
 * unnumbered. Confirm with the family before this leaves placeholder.
 */
type Print = {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
};

const PRINTS: Print[] = [
  {
    src: "/web_assets/heritage/siam-map-1753.jpg",
    width: 1200,
    height: 848,
    alt: "An eighteenth-century engraved French map of mainland Southeast Asia",
    caption: "Map of Siam, Tonkin, Pegu, Ava and Arakan, circa 1753",
  },
  {
    src: "/web_assets/heritage/hoa-ly-in-the-kitchen.jpg",
    width: 843,
    height: 1200,
    alt: "A girl in a white tunic with long plaits, crouched over a charcoal stove",
    caption:
      "Demonstrating her early culinary acumen, she often found her way to the kitchen to experiment with various dishes which would later become her signature dishes",
  },
  {
    src: "/web_assets/heritage/hoa-ly-portrait.jpg",
    width: 829,
    height: 1200,
    alt: "A studio portrait of Madame Hoa Ly in a pale ao dai, hair swept up, wearing drop earrings",
    caption:
      "So famous for her charm and beauty that the Court of Hue would seek her grandmother’s approval to betroth her to Bao Dai, the last emperor of Vietnam",
  },
  {
    src: "/web_assets/heritage/hoa-ly-wedding-saigon-1938.jpg",
    width: 943,
    height: 1200,
    alt: "A bride in a white veil and long train beside a groom in a white dinner jacket, on stone steps",
    caption:
      "On her wedding day with her husband, Jean Dauplay, in front of Hôtel de Ville in Saigon, circa 1938",
  },
  {
    src: "/web_assets/heritage/hoa-ly-jardin-albert-nice.jpg",
    width: 848,
    height: 1200,
    alt: "A couple walking a garden path, she carrying a parasol",
    caption: "Strolling with her husband, Jean Dauplay, at Le Jardin Albert 1er in Nice",
  },
  {
    src: "/web_assets/heritage/hoa-ly-notre-dame-paris.jpg",
    width: 875,
    height: 1200,
    alt: "Madame Hoa Ly on a bridge rail, Notre-Dame de Paris behind her",
    caption:
      "In front of Notre-Dame de Paris in the early 1950s, wearing a silk ao dai beneath a black Astrakhan overcoat",
  },
  {
    src: "/web_assets/heritage/hoa-ly-la-napoule.jpg",
    width: 1200,
    height: 720,
    alt: "Madame Hoa Ly leaning against a rock at the water's edge, a stone fort behind",
    caption:
      "Leaning back against a rock, a relaxing moment at Mandelieu-la-Napoule on the Côte d’Azur",
  },
  {
    src: "/web_assets/heritage/hoa-ly-milan-fair.jpg",
    width: 896,
    height: 1200,
    alt: "Madame Hoa Ly gesturing towards a lacquer panel on an exhibition wall",
    caption: "Selected among young Annamites to represent Vietnam at the Milan Fair",
  },
  {
    src: "/web_assets/heritage/hoa-ly-milan-fair-officers.jpg",
    width: 948,
    height: 1200,
    alt: "Madame Hoa Ly with Italian officers beneath a framed portrait at the Vietnam pavilion",
    caption:
      "Accompanied by Italian officers at the Milan Fair, beneath the portrait of Bao Dai, the last Emperor of Vietnam",
  },
  {
    src: "/web_assets/heritage/hoa-ly-mekong-vientiane.jpg",
    width: 857,
    height: 1200,
    alt: "Madame Hoa Ly in a white ao dai on a riverbank, the Mekong behind her",
    caption:
      "On the bank of the Mekong river in Vientiane, before visiting Mae Tou, her mother-in-law, circa 1954",
  },
];

/* The scatter: a degree of tilt and a nudge down the wall, per print.
   Hand-set rather than random so the arrangement is the same every visit. */
const SCATTER = [
  "sm:translate-y-0 sm:-rotate-[0.8deg]",
  "sm:translate-y-10 sm:rotate-[1.1deg]",
  "sm:-translate-y-4 sm:rotate-[0.5deg]",
  "sm:translate-y-14 sm:-rotate-[1.2deg]",
  "sm:translate-y-2 sm:rotate-[0.7deg]",
  "sm:translate-y-16 sm:-rotate-[0.6deg]",
  "sm:translate-y-4 sm:rotate-[0.9deg]",
  "sm:translate-y-20 sm:-rotate-[1deg]",
  "sm:translate-y-6 sm:rotate-[0.4deg]",
  "sm:translate-y-12 sm:-rotate-[0.9deg]",
];

export default function HouseArchive() {
  const scope = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-archive-head] > *", {
        autoAlpha: 0,
        y: 28,
        duration: 1.4,
        ease: "power2.out",
        stagger: 0.14,
        scrollTrigger: {
          trigger: "[data-archive-head]",
          start: "top 78%",
          toggleActions: "play none none reverse",
        },
      });

      // Each print surfaces on its own, at the pace of the one before it
      gsap.utils.toArray<HTMLElement>("[data-archive-print]").forEach((print) => {
        gsap.from(print, {
          autoAlpha: 0,
          y: 26,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: print,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={scope} className="relative z-[1] mx-auto mt-28 max-w-5xl sm:mt-40">
      <div data-archive-head className="max-w-2xl">
        <p className="font-serif text-[clamp(1.75rem,6vw,2.25rem)] leading-[1.2] text-parchment">
          The family kept its photographs.{" "}
          <em className="text-clay">They hang in the house still.</em>
        </p>
        <p className="mt-5 max-w-prose text-base leading-relaxed text-cream/70">
          Madame Hoa Ly in Saigon and Paris, Nice and Vientiane — and once, at
          sixteen, already finding her way to the kitchen.
        </p>
      </div>

      {/* A wall, not a grid: columns let each print keep its own height,
          and the tilt and offsets break the ranks that would otherwise form. */}
      <div className="mt-16 gap-x-6 sm:mt-24 sm:columns-2 sm:gap-x-10 lg:columns-3">
        {PRINTS.map((print, i) => (
          <figure
            key={print.src}
            data-archive-print
            className={`mb-10 break-inside-avoid sm:mb-16 ${SCATTER[i % SCATTER.length]}`}
          >
            <Image
              src={print.src}
              alt={print.alt}
              width={print.width}
              height={print.height}
              sizes="(min-width: 1024px) 20rem, (min-width: 640px) 40vw, 85vw"
              className="h-auto w-full rounded-sm ring-1 ring-gold/25 shadow-[0_14px_40px_-18px_rgba(0,0,0,0.65)]"
            />
            <figcaption className="mt-3 font-sans text-[0.625rem] leading-relaxed tracking-[0.18em] uppercase text-cream/55">
              {print.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
