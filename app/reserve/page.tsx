import type { Metadata } from "next";
import ReserveMock from "@/components/reserve/ReserveMock";
import { reserveSerif } from "@/components/reserve/serif-font";

export const metadata: Metadata = {
  title: "Reserve a Table — Le Dalat, Bangkok",
  description:
    "Reserve an evening at Le Dalat: Vietnamese fine dining in a wooden villa on Sukhumvit Soi 23, family run since 1983.",
};

/**
 * /reserve — GATE 5A DESIGN MOCKUP (no backend). Accepts the homepage
 * widget's handoff (?date=YYYY-MM-DD&party=N; legacy ?guests= honoured)
 * and works equally when opened bare.
 */
export default async function ReservePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  const date = one(params.date)?.match(/^\d{4}-\d{2}-\d{2}$/) ? one(params.date)! : null;
  const partyRaw = Number(one(params.party) ?? one(params.guests));
  const party = Number.isInteger(partyRaw) && partyRaw > 0 ? partyRaw : null;

  return (
    <main className={`reserve-light min-h-svh ${reserveSerif.variable}`}>
      <ReserveMock initialDate={date} initialParty={party} />
    </main>
  );
}
