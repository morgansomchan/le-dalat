import { redirect } from "next/navigation";

/**
 * The flow's old address — forward saved links to /reservation with the
 * handoff params intact.
 */
export default async function ReserveRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const v = Array.isArray(value) ? value[0] : value;
    if (v) query.set(key, v);
  }
  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  redirect(`/reservation${suffix}`);
}
