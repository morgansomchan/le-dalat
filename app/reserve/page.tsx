import { redirect } from "next/navigation";

/**
 * The flow's old address — forward saved links to /reservation with the
 * handoff params intact. It was the Instagram bio's booking link before
 * /reserve/ig, so an untagged visit still counts as "instagram-reserve"
 * (an explicit src, ref or utm_source on the link wins).
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
  if (!query.has("src") && !query.has("ref") && !query.has("utm_source")) {
    query.set("src", "instagram-reserve");
  }
  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  redirect(`/reservation${suffix}`);
}
