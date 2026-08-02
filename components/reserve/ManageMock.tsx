"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ScreenPhoto, { type PhotoKey } from "./ScreenPhoto";
import {
  PHONE_DISPLAY,
  fmtSlot,
  sampleBooking,
  speakDate,
  speakParty,
} from "@/lib/reserve-mock";

/**
 * GATE 5A — DESIGN MOCKUP of the change/cancel page. Gate 6 will email
 * guests a link like this; the token IS their access (no accounts,
 * ever). Hardcoded sample booking; view → one calm confirm → released.
 * Same photographic grammar as /reserve: their table while it stands,
 * the garden once the evening is let go.
 */

type Stage = "view" | "confirm" | "released";

export default function ManageMock({ known }: { known: boolean }) {
  const booking = sampleBooking();
  const [stage, setStage] = useState<Stage>("view");

  const photo: PhotoKey = !known ? "mural" : stage === "released" ? "garden" : "feast";

  const glassCard = "border border-gold/25 bg-black/40 p-6 backdrop-blur-md sm:p-7";
  const quietLink =
    "font-sans text-[0.6875rem] tracking-[0.2em] uppercase text-cream/60 underline decoration-cream/20 underline-offset-4 transition-colors duration-300 hover:text-cream";
  const goldCta =
    "inline-flex min-h-11 items-center justify-center border border-gold/40 px-5 font-sans text-[0.6875rem] tracking-[0.25em] uppercase text-gold transition-colors duration-500 hover:border-gold hover:text-parchment";

  const header = (
    <header className="flex items-center justify-between">
      <Link href="/" className={quietLink}>
        ← The garden
      </Link>
      <Image
        src="/web_assets/LD-logo-crop.svg"
        alt="Le Dalat"
        width={200}
        height={200}
        className="h-auto w-11 opacity-95"
      />
    </header>
  );

  return (
    <div className="relative min-h-svh">
      <ScreenPhoto active={photo} />

      <div className="mx-auto flex min-h-svh w-full max-w-md flex-col px-5 pb-16 pt-6 sm:max-w-lg">
        {header}

        {/* an unrecognised token: honest, warm, with the human fallback */}
        {!known ? (
          <section className="reserve-screen mt-10 sm:mt-14">
            <p className="eyebrow">Hm.</p>
            <h1 className="mt-3 font-serif text-[clamp(2.25rem,9vw,3rem)] leading-[1.08] text-parchment">
              The book does not
              <br />
              <em className="text-gold">know this page.</em>
            </h1>
            <div className={`${glassCard} mt-8`}>
              <p className="font-sans text-sm leading-relaxed text-cream/80">
                This link is not one the house recognises — it may have
                expired, or arrived incomplete. Your confirmation email holds
                the true one, and the telephone always works:{" "}
                {PHONE_DISPLAY}.
              </p>
              <Link href="/reserve" className={`${goldCta} mt-6 w-full`}>
                Make a new reservation
              </Link>
            </div>
          </section>
        ) : stage !== "released" ? (
          <section className="reserve-screen mt-10 sm:mt-14">
            <p className="eyebrow">Your reservation</p>
            <h1 className="mt-3 font-serif text-[clamp(2.25rem,9vw,3rem)] leading-[1.08] text-parchment">
              {booking.name}, your table
              <br />
              <em className="text-gold">waits.</em>
            </h1>

            <div className={`${glassCard} mt-8`}>
              <dl className="space-y-3">
                {[
                  ["Evening", speakDate(booking.date)],
                  ["Hour", fmtSlot(booking.time)],
                  ["Party", speakParty(booking.party)],
                  ["Seating", booking.seating],
                  ["Reference", booking.reference],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4">
                    <dt className="font-sans text-[0.625rem] tracking-[0.25em] uppercase text-gold/80">
                      {k}
                    </dt>
                    <dd className="font-serif text-lg text-cream">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 border-t border-gold/20 pt-4">
                <p className="font-sans text-sm leading-relaxed text-cream/75">
                  Plans shift — the house understands. To move the evening or
                  the party, telephone {PHONE_DISPLAY} and the family will
                  re-set the table. To let the evening go, release it below.
                </p>
              </div>

              {stage === "view" ? (
                <button
                  type="button"
                  onClick={() => setStage("confirm")}
                  className="mt-6 inline-flex min-h-12 w-full items-center justify-center border border-clay/50 px-5 font-sans text-[0.6875rem] tracking-[0.25em] uppercase text-clay transition-colors duration-500 hover:border-clay hover:bg-clay/10"
                >
                  Release the table
                </button>
              ) : (
                <div className="reserve-screen mt-6 border border-clay/40 bg-black/30 p-5">
                  <p className="font-serif text-lg leading-snug text-parchment">
                    Let {speakDate(booking.date)} go?
                  </p>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-cream/70">
                    The table returns to the book and another party may take
                    it. No charge, no stain — the house simply says: until
                    next time.
                  </p>
                  <div className="mt-4 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setStage("released")}
                      className="inline-flex min-h-12 flex-1 items-center justify-center border border-clay/60 bg-clay/15 px-4 font-sans text-[0.6875rem] tracking-[0.2em] uppercase text-clay transition-colors duration-300 hover:bg-clay/25"
                    >
                      Release it
                    </button>
                    <button
                      type="button"
                      onClick={() => setStage("view")}
                      className="inline-flex min-h-12 flex-1 items-center justify-center border border-gold/40 px-4 font-sans text-[0.6875rem] tracking-[0.2em] uppercase text-gold transition-colors duration-300 hover:border-gold"
                    >
                      Keep the table
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="reserve-screen mt-10 sm:mt-14">
            <p className="eyebrow">Released</p>
            <h1 className="mt-3 font-serif text-[clamp(2.25rem,9vw,3rem)] leading-[1.08] text-parchment">
              The evening is
              <br />
              <em className="text-gold">let go.</em>
            </h1>
            <div className={`${glassCard} mt-8`}>
              <p className="font-sans text-sm leading-relaxed text-cream/80">
                {speakDate(booking.date)} returns to the book, and the lamps
                will shine for someone else. The house hopes to set your table
                another night.
              </p>
              <Link href="/reserve" className={`${goldCta} mt-6 w-full`}>
                Choose another evening
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
