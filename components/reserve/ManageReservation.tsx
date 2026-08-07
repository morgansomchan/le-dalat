"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PHONE_DISPLAY, fmtSlot, speakDate, speakParty } from "@/lib/reserve-mock";
import {
  getReservationByToken,
  cancelReservationByToken,
  type ManagedReservation,
} from "@/lib/reserve-engine";

/**
 * /reservation/[token] — live (Amendment 2). The token IS the guest's
 * access: no login, no account, ever. The page shows only what the
 * engine's lookup allows (first name, when, how many — never tables or
 * contact details). Cancel walks view → one calm confirm → released,
 * through the shared transition path. The v1 boundary: changes are not
 * self-serve — cancel and rebook, or telephone the house.
 */

type Stage = "view" | "confirm" | "released";

export default function ManageReservation({ token }: { token: string }) {
  // fixed at mount — the pure-render clock; the server re-checks anyway
  const [loadedAt] = useState(() => Date.now());
  const [looked, setLooked] = useState<ManagedReservation | null>(null);
  const [failed, setFailed] = useState(false);
  const [stage, setStage] = useState<Stage>("view");
  const [releasing, setReleasing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const result = await getReservationByToken(token);
        if (cancelled) return;
        setLooked(result);
        if (result.found && result.status === "cancelled") setStage("released");
      } catch {
        if (!cancelled) setFailed(true);
      }
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [token]);

  const release = () => {
    if (releasing) return;
    setReleasing(true);
    void (async () => {
      try {
        const result = await cancelReservationByToken(token);
        if (result.success) {
          setStage("released");
        } else {
          // seated meanwhile, already cancelled, or the hour has struck —
          // re-read the truth and render whatever state it is in now
          setLooked(await getReservationByToken(token));
          setStage("view");
        }
      } catch {
        setFailed(true);
      } finally {
        setReleasing(false);
      }
    })();
  };

  const eyebrow = "font-sans text-[0.625rem] tracking-[0.3em] uppercase text-gold";
  const question =
    "mt-4 font-serif text-[clamp(2.375rem,10vw,3rem)] font-medium leading-[1.1] text-navy";
  const hint = "font-sans text-[0.8125rem] leading-relaxed text-navy/55";
  const quietAction =
    "font-sans text-[0.6875rem] tracking-[0.22em] uppercase text-navy/70 underline decoration-navy/25 underline-offset-4 transition-colors duration-300 hover:text-navy";

  const booking = looked?.found ? looked : null;
  const cancellable =
    booking !== null &&
    booking.status === "confirmed" &&
    new Date(`${booking.res_date}T${booking.res_time}:00`).getTime() > loadedAt;

  const seal = booking && (
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
        key={`${looked === null}${stage}`}
        className="page-turn mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-12 text-center"
        aria-live="polite"
      >
        {/* the book is opened — the flow's quiet dots, no spinners */}
        {looked === null && !failed && (
          <span className="inline-flex items-center gap-2.5">
            <span className={hint}>Asking the book</span>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1 w-1 animate-pulse rounded-full bg-navy/70"
                style={{ animationDelay: `${i * 240}ms` }}
              />
            ))}
          </span>
        )}

        {/* the book cannot be reached */}
        {failed && (
          <>
            <p className={eyebrow}>Reservations</p>
            <h1 className={question}>
              The book cannot be <em>reached.</em>
            </h1>
            <p className={`mt-6 max-w-sm ${hint}`}>
              Nothing has changed. Please try again in a moment, or telephone
              the house: {PHONE_DISPLAY}.
            </p>
          </>
        )}

        {/* an unrecognised link: honest, warm, and uniform */}
        {looked !== null && !looked.found && !failed && (
          <>
            <p className={eyebrow}>Reservations</p>
            <h1 className={question}>
              The book does not <em>know this page.</em>
            </h1>
            <p className={`mt-6 max-w-sm ${hint}`}>
              This link is not one the house recognises — it may have expired,
              or arrived incomplete. Your confirmation holds the true one, and
              the telephone always works: {PHONE_DISPLAY}.
            </p>
            <Link href="/reservation" className={`mt-10 ${quietAction}`}>
              Make a new reservation
            </Link>
          </>
        )}

        {/* the booking, standing */}
        {booking && stage !== "released" && (
          <>
            <p className={eyebrow}>Your reservation</p>
            <h1 className={question}>
              {booking.first_name ? `${booking.first_name}, your` : "Your"} table{" "}
              <em>waits.</em>
            </h1>

            {seal}

            <dl className="mt-9 space-y-2.5">
              {[
                ["Evening", speakDate(booking.res_date)],
                ["Hour", fmtSlot(booking.res_time)],
                ["Party", speakParty(booking.party_size)],
                [
                  "Seating",
                  booking.seating_pref === "madams_room"
                    ? "Madam's Room"
                    : (booking.seating_pref ?? "Chosen by the house"),
                ],
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
                  re-set the table.
                  {cancellable && " To let the evening go, release it below."}
                </p>
                {cancellable && (
                  <button
                    type="button"
                    onClick={() => setStage("confirm")}
                    className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full border border-clay/50 px-8 font-sans text-[0.6875rem] tracking-[0.25em] uppercase text-clay transition-colors duration-300 hover:border-clay"
                  >
                    Release the table
                  </button>
                )}
              </>
            ) : (
              <div className="page-turn mt-9 max-w-sm">
                <p className="font-serif text-xl italic leading-relaxed text-navy">
                  Let {speakDate(booking.res_date)} go?
                </p>
                <p className={`mt-2 ${hint}`}>
                  The table returns to the book and another party may take it.
                  No charge, no stain — the house simply says: until next time.
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    disabled={releasing}
                    onClick={release}
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-clay px-7 font-sans text-[0.6875rem] tracking-[0.22em] uppercase text-parchment transition-opacity duration-300 hover:opacity-90 disabled:opacity-50"
                  >
                    {releasing ? "Releasing…" : "Release it"}
                  </button>
                  <button
                    type="button"
                    disabled={releasing}
                    onClick={() => setStage("view")}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-navy/30 px-7 font-sans text-[0.6875rem] tracking-[0.22em] uppercase text-navy transition-colors duration-300 hover:border-navy disabled:opacity-50"
                  >
                    Keep the table
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* the evening, let go */}
        {booking && stage === "released" && (
          <>
            <p className={eyebrow}>Released</p>
            <h1 className={question}>
              The evening is <em>let go.</em>
            </h1>
            {seal}
            <p className={`mt-8 max-w-sm ${hint}`}>
              {speakDate(booking.res_date)} returns to the book, and the lamps
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
