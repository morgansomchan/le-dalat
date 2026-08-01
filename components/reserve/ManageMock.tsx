"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MoonGate from "./MoonGate";
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
 * ever). Hardcoded sample booking; the cancel walks view → one calm
 * confirm → the released state.
 */

type Stage = "view" | "confirm" | "released";

export default function ManageMock({ known }: { known: boolean }) {
  const booking = sampleBooking();
  const [stage, setStage] = useState<Stage>("view");

  const quietLink =
    "font-sans text-[0.6875rem] tracking-[0.2em] uppercase text-cream/50 underline decoration-cream/20 underline-offset-4 transition-colors duration-300 hover:text-cream";

  /* An unrecognised token: honest, warm, with the human fallback. */
  if (!known) {
    return (
      <div className="reserve-screen mx-auto w-full max-w-md px-6 pb-24 pt-12 text-center">
        <Image
          src="/web_assets/LD-logo-crop.svg"
          alt="Le Dalat"
          width={200}
          height={200}
          className="mx-auto h-auto w-12 opacity-90"
        />
        <div className="mt-10">
          <MoonGate date={null} time={null} party={null} />
        </div>
        <h1 className="mt-10 font-serif text-[2rem] leading-tight text-parchment">
          The book does not <em className="text-clay">know this page.</em>
        </h1>
        <p className="mx-auto mt-4 max-w-xs font-sans text-sm leading-relaxed text-cream/70">
          This link is not one the house recognises — it may have expired, or
          arrived incomplete. Your confirmation email holds the true one, and
          the telephone always works: {PHONE_DISPLAY}.
        </p>
        <Link href="/reserve" className={`${quietLink} mt-10 inline-block`}>
          Make a new reservation
        </Link>
      </div>
    );
  }

  return (
    <div className="reserve-screen mx-auto w-full max-w-md px-6 pb-24 pt-12 text-center">
      <Link href="/" aria-label="Return to the homepage" className="inline-block">
        <Image
          src="/web_assets/LD-logo-crop.svg"
          alt="Le Dalat"
          width={200}
          height={200}
          className="mx-auto h-auto w-12 opacity-90"
        />
      </Link>

      <div className="mt-10">
        <MoonGate
          date={booking.date}
          time={booking.time}
          party={booking.party}
          filled={stage !== "released"}
          released={stage === "released"}
        />
      </div>

      {stage !== "released" ? (
        <>
          <p className="eyebrow mt-10">Your reservation</p>
          <h1 className="mt-4 font-serif text-[2rem] leading-tight text-parchment">
            {booking.name}, your table <em className="text-clay">waits.</em>
          </h1>

          <dl className="mt-9 space-y-3.5 border-y border-gold/20 py-7 text-left">
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

          <p className="mt-7 font-sans text-sm leading-relaxed text-cream/70">
            Plans shift — the house understands. To move the evening or the
            party, telephone {PHONE_DISPLAY} and the family will re-set the
            table. To let the evening go, release it below.
          </p>

          {stage === "view" ? (
            <button
              type="button"
              onClick={() => setStage("confirm")}
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center border border-clay/50 px-5 font-sans text-[0.6875rem] tracking-[0.25em] uppercase text-clay transition-colors duration-500 hover:border-clay hover:bg-clay/10"
            >
              Release the table
            </button>
          ) : (
            <div className="reserve-screen mt-8 border border-clay/40 bg-black/25 p-5 text-left">
              <p className="font-serif text-lg leading-snug text-parchment">
                Let {speakDate(booking.date)} go?
              </p>
              <p className="mt-2 font-sans text-sm leading-relaxed text-cream/70">
                The table returns to the book and another party may take it.
                No charge, no stain — the house simply says: until next time.
              </p>
              <div className="mt-5 flex gap-1.5">
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
        </>
      ) : (
        <>
          <p className="eyebrow mt-10">Released</p>
          <h1 className="mt-4 font-serif text-[2rem] leading-tight text-parchment">
            The evening is <em className="text-clay">let go.</em>
          </h1>
          <p className="mx-auto mt-4 max-w-xs font-sans text-sm leading-relaxed text-cream/70">
            {speakDate(booking.date)} returns to the book, and the lamps will
            shine for someone else. The house hopes to set your table another
            night.
          </p>
          <Link
            href="/reserve"
            className="mt-10 inline-flex min-h-11 items-center border border-gold/40 px-5 font-sans text-[0.6875rem] tracking-[0.25em] uppercase text-gold transition-colors duration-500 hover:border-gold hover:text-parchment"
          >
            Choose another evening
          </Link>
        </>
      )}
    </div>
  );
}
