import type { Metadata } from "next";
import ManageReservation from "@/components/reserve/ManageReservation";
import { reserveSerif } from "@/components/reserve/serif-font";

export const metadata: Metadata = {
  title: "Your Reservation — Le Dalat, Bangkok",
};

/**
 * /reservation/[token] — the guest's booking, live (Amendment 2). The
 * token IS their access: no accounts, ever. Gate 6 emails these links;
 * the ceremony screen carries one immediately after booking.
 */
export default async function ManagePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <main className={`reserve-light min-h-svh ${reserveSerif.variable}`}>
      <ManageReservation token={token} />
    </main>
  );
}
