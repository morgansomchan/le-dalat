import Link from "next/link";

/**
 * Stub page — the Menu page (with the full food gallery) is a later phase.
 * Exists only so the homepage's "The full menu" link has somewhere to land.
 */
export default function MenuPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-umber-deep px-6 text-center">
      <p className="eyebrow">The Menu</p>
      <h1 className="mt-6 max-w-md font-serif text-3xl text-parchment sm:text-4xl">
        The kitchen is writing.
      </h1>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/70">
        The full menu joins the site soon. The signature dishes are already
        waiting on the homepage.
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
