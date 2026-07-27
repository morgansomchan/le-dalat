import Link from "next/link";

/**
 * Stub page — the reservation flow is not built in this phase (CLAUDE.md).
 * Exists only so reserve affordances on the homepage have somewhere to land.
 */
export default function ReservationPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-navy-deep px-6 text-center">
      <p className="eyebrow">Reservations</p>
      <h1 className="mt-6 max-w-md font-serif text-3xl text-parchment sm:text-4xl">
        The book opens soon.
      </h1>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/70">
        Online reservations are on their way. For now, the family answers the
        telephone as it always has.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex min-h-11 items-center border border-gold/40 px-5 font-sans text-[0.6875rem] tracking-[0.25em] uppercase text-gold transition-colors duration-500 hover:border-gold hover:text-parchment"
      >
        Return to the garden
      </Link>
    </main>
  );
}
