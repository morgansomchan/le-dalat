import Image from "next/image";
import { fmtSlot, speakDateShort, speakParty } from "@/lib/reserve-mock";

/**
 * The moon gate — the flow's signature. A circular table at the head of
 * the page that SETS ITSELF as the guest chooses: empty ring → the
 * evening appears → the hour joins it → the guests circle it. On the
 * confirmation it fills with the set table seen through the arch.
 * (Design brief: the villa's moon-gate window; the circle motif.)
 */

/* Swappable image slot — the set table, seen through the gate. */
const SET_TABLE_IMAGE = "/web_assets/Food/Copy of Le Dalat_20Oct20255148.jpg";

export default function MoonGate({
  date,
  time,
  party,
  filled = false,
  consulting = false,
  released = false,
}: {
  date: string | null;
  time: string | null;
  party: number | null;
  /** The ceremony: the table appears through the gate. */
  filled?: boolean;
  /** The book is being consulted — the gold ring draws itself. */
  consulting?: boolean;
  /** After a cancellation: the gate stands empty again. */
  released?: boolean;
}) {
  return (
    <div className="relative mx-auto h-44 w-44">
      {/* the drawn ring while the book is consulted */}
      {consulting && (
        <svg
          aria-hidden
          viewBox="0 0 200 200"
          className="moon-gate-consult absolute -inset-2 h-48 w-48"
        >
          <circle cx="100" cy="100" r="90" />
        </svg>
      )}

      <div
        className={`moon-gate relative flex h-44 w-44 items-center justify-center overflow-hidden text-center transition-opacity duration-700 ${
          released ? "opacity-50" : ""
        }`}
      >
        {filled ? (
          <>
            <Image
              src={SET_TABLE_IMAGE}
              alt="A table set for the evening"
              fill
              sizes="176px"
              className="object-cover"
            />
            {/* candlelit scrim so the gold rim still reads */}
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_35%,rgba(18,11,5,0.55)_100%)]"
            />
          </>
        ) : (
          <div className="px-6">
            {date ? (
              <>
                <p className="font-serif text-xl leading-snug text-parchment">
                  {speakDateShort(date)}
                </p>
                <p
                  className={`mt-1 font-serif text-lg transition-opacity duration-500 ${
                    time ? "text-gold opacity-100" : "text-cream/25"
                  }`}
                >
                  {time ? fmtSlot(time) : "· — ·"}
                </p>
                {party !== null && (
                  <p className="mt-2 font-sans text-[0.625rem] tracking-[0.22em] uppercase text-cream/60">
                    {speakParty(party)}
                  </p>
                )}
              </>
            ) : (
              <p className="font-serif text-base italic leading-relaxed text-cream/40">
                an evening,
                <br />
                not yet chosen
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
