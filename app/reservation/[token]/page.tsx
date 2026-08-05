import type { Metadata } from "next";
import ManageMock from "@/components/reserve/ManageMock";
import { reserveSerif } from "@/components/reserve/serif-font";

export const metadata: Metadata = {
  title: "Your Reservation — Le Dalat, Bangkok",
};

/**
 * /reservation/[token] — GATE 5A DESIGN MOCKUP. The token IS the guest's
 * access (no accounts, ever; Gate 6 emails these links). Only the sample
 * token resolves; any other shows the unrecognised-link state.
 */
export default async function ManagePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <main className={`reserve-light min-h-svh ${reserveSerif.variable}`}>
      <ManageMock known={token === "sample-token"} />
    </main>
  );
}
