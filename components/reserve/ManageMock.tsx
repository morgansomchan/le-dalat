"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PHONE_DISPLAY, fmtSlot, sampleBooking, speakDate, speakParty } from "@/lib/reserve-mock";

/**
 * GATE 5A REVISION — DESIGN MOCKUP of the change/cancel page, daylight
 * edition. Gate 6 will email guests a link like this; the token IS
 * their access (no accounts, ever). Hardcoded sample booking; the walk
 * is view → one calm confirm → released. Same parchment room, same
 * circle motif — the booking lives inside the seal.
 */

type Stage = "view" | "confirm" | "released";

export default function ManageMock({ known }: { known: boolean }) {
  const booking = sampleBooking();
  const [stage, setStage] = useState<Stage>("view");

  const eyebrow = "font-sans text-[0.625rem] tracking-[0.3em] uppercase text-gold";
  const question =
    "mt-4 font-serif text-[clamp(2.375rem,10vw,3rem)] font-medium leading-[1.1] text-navy";
  const hint = "font-sans text-[0.8125rem] leading-relaxed text-navy/55";
  const quietAction =
    "font-sans text-[0.6875rem] tracking-[0.22em] uppercase text-navy/70 underline decoration-navy/25 underline-offset-4 transition-colors duration-300 hover:text-navy";

  const seal = (
    <div className="mt-10 flex h-36 w-36 items-center justify-center rounded-full border border-gold/70 p-2">
      <div
        className={`flex h-full w-full flex-col items-center justify-center rounded-full border border-navy/15 transition-opacity duration-700 ${
          stage === "released" ? "opacity-40" : ""
        }`}
      >
        <span className="font-serif text-2xl tracking-wide text-navy">{booking.reference}</span>
        <span className="mt-1 font-sans text-[0.5625rem] tracking-[0.25em] uppercase text-navy/50">
          Reference
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-svh flex-col">
      <header className="mx-auto w-full max-w-md px-6 pt-6">
        <div className="flex items-center justify-between">
          <Link href="/" className={quietAction}>
            ← The garden
          </Link>
          <Link href="/" aria-label="Return to the homepage">
            <Image
              src="/web_assets/LD-logo-crop.svg"
              alt="Le Dalat"
              width={200}
              height={200}
              className="h-auto w-11"
            />
          </Link>
        </div>
      </header>

      <main
        key={stage + String(known)}
        className="page-turn mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-12 text-center"
      >
        {/* an unrecognised token: honest, warm, with the human fallback */}
        {!known ? (
          <>
            <p className={eyebrow}>Reservations</p>
            <h1 className={question}>
              The book does not <em>know this page.</em>
            </h1>
            <p className={`mt-6 max-w-sm ${hint}`}>
              This link is not one the house recognises — it may have expired,
              or arrived incomplete. Your confirmation email holds the true
              one, and the telephone always works: {PHONE_DISPLAY}.
            </p>
            <Link href="/reservation" className={`mt-10 ${quietAction}`}>
              Make a new reservation
            </Link>
          </>
        ) : stage !== "released" ? (
          <>
            <p className={eyebrow}>Your reservation</p>
            <h1 className={question}>
              {booking.name}, your table <em>waits.</em>
            </h1>

            {seal}

            <dl className="mt-9 space-y-2.5">
              {[
                ["Evening", speakDate(booking.date)],
                ["Hour", fmtSlot(booking.time)],
                ["Party", speakParty(booking.party)],
                ["Seating", booking.seating],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col items-center">
                  <dt className="font-sans text-[0.5625rem] tracking-[0.25em] uppercase text-navy/45">
                    {k}
                  </dt>
                  <dd className="font-serif text-xl text-navy">{v}</dd>
                </div>
              ))}
            </dl>

            {stage === "view" ? (
              <>
                <p className={`mt-9 max-w-sm ${hint}`}>
                  Plans shift — the house understands. To move the evening or
                  the party, telephone {PHONE_DISPLAY} and the family will
                  re-set the table. To let the evening go, release it below.
                </p>
                <button
                  type="button"
                  onClick={() => setStage("confirm")}
                  className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full border border-clay/50 px-8 font-sans text-[0.6875rem] tracking-[0.25em] uppercase text-clay transition-colors duration-300 hover:border-clay"
                >
                  Release the table
                </button>
              </>
            ) : (
              <div className="page-turn mt-9 max-w-sm">
                <p className="font-serif text-xl italic leading-relaxed text-navy">
                  Let {speakDate(booking.date)} go?
                </p>
                <p className={`mt-2 ${hint}`}>
                  The table returns to the book and another party may take it.
                  No charge, no stain — the house simply says: until next time.
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStage("released")}
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-clay px-7 font-sans text-[0.6875rem] tracking-[0.22em] uppercase text-parchment transition-opacity duration-300 hover:opacity-90"
                  >
                    Release it
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage("view")}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-navy/30 px-7 font-sans text-[0.6875rem] tracking-[0.22em] uppercase text-navy transition-colors duration-300 hover:border-navy"
                  >
                    Keep the table
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <p className={eyebrow}>Released</p>
            <h1 className={question}>
              The evening is <em>let go.</em>
            </h1>
            {seal}
            <p className={`mt-8 max-w-sm ${hint}`}>
              {speakDate(booking.date)} returns to the book, and the lamps
              will shine for someone else. The house hopes to set your table
              another night.
            </p>
            <Link href="/reservation" className={`mt-10 ${quietAction}`}>
              Choose another evening
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
