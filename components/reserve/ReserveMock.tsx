"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MoonGate from "./MoonGate";
import {
  LUNCH_SLOTS,
  DINNER_SLOTS,
  ONLINE_PARTY_MAX,
  PHONE_DISPLAY,
  SOLD_OUT_SLOT,
  MOCK_ALTERNATIVES,
  fmtSlot,
  upcomingDays,
  speakDate,
  speakParty,
} from "@/lib/reserve-mock";

/**
 * GATE 5A — DESIGN MOCKUP. Clickable screens, hardcoded data, staged
 * delays. No Supabase, no availability logic. The mock rule: 7:30 pm is
 * always "fully seated" so the sold-out path can be walked; every other
 * hour is free.
 *
 * The room: act two of the homepage — the guest is INSIDE the house now
 * (umber, candlelight, gold hairlines). The signature is the moon gate
 * above the flow, setting itself as choices are made.
 */

type Screen = "plan" | "book" | "details" | "done";
type Verdict = "consulting" | "open" | "soldout";

const PHONE_CODES = ["+66", "+1", "+33", "+44", "+65", "+81", "+86"];

export default function ReserveMock({
  initialDate,
  initialParty,
}: {
  initialDate: string | null;
  initialParty: number | null;
}) {
  // The next fortnight, fixed at mount (mock — no live clock concerns).
  const [days] = useState(() => upcomingDays(new Date(), 14));

  const [screen, setScreen] = useState<Screen>("plan");
  const [date, setDate] = useState<string | null>(() =>
    initialDate && days.some((d) => d.key === initialDate) ? initialDate : null,
  );
  const [party, setParty] = useState(initialParty && initialParty >= 1 ? initialParty : 2);
  const [seating, setSeating] = useState<"house" | "madams">("house");
  const [hour, setHour] = useState<string | null>(null);

  const [verdict, setVerdict] = useState<Verdict>("consulting");
  const consultTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Guest details + touched-field validation (no browser defaults).
  const [name, setName] = useState("");
  const [phoneCode, setPhoneCode] = useState("+66");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [settingTable, setSettingTable] = useState(false);

  const tooLarge = party > ONLINE_PARTY_MAX;

  useEffect(() => () => {
    if (consultTimer.current) clearTimeout(consultTimer.current);
  }, []);

  /** Ask the book (mock): a held breath, then the verdict. */
  const consult = (forHour: string) => {
    setHour(forHour);
    setScreen("book");
    setVerdict("consulting");
    if (consultTimer.current) clearTimeout(consultTimer.current);
    consultTimer.current = setTimeout(() => {
      setVerdict(forHour === SOLD_OUT_SLOT ? "soldout" : "open");
    }, 1500);
  };

  /** The final promise (mock): the table is set after a slow beat. */
  const reserve = () => {
    setSettingTable(true);
    if (consultTimer.current) clearTimeout(consultTimer.current);
    consultTimer.current = setTimeout(() => {
      setSettingTable(false);
      setScreen("done");
      window.scrollTo({ top: 0 });
    }, 1500);
  };

  const phoneDigits = phone.replace(/\D/g, "");
  const nameOk = name.trim().length > 0;
  const phoneOk = phoneDigits.length >= 8 && phoneDigits.length <= 12;
  const emailOk = email.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const detailsOk = nameOk && phoneOk && emailOk;

  /* ── shared dressing ─────────────────────────────────────────────── */

  const eyebrowRow = (numeral: string, title: string) => (
    <div className="flex items-center gap-3">
      <span className="eyebrow">{numeral} · {title}</span>
      <span aria-hidden className="h-px flex-1 bg-gold/15" />
    </div>
  );

  const fieldLabel = "font-sans text-[0.625rem] tracking-[0.25em] uppercase text-gold";
  const inputBox =
    "mt-2 w-full border border-cream/15 bg-black/20 px-3.5 py-3 font-sans text-[0.9375rem] text-cream placeholder:text-cream/25 focus:border-gold/60 focus:outline-none transition-colors duration-300";
  const softError = "mt-2 font-sans text-xs leading-relaxed text-clay";
  const primaryCta =
    "inline-flex min-h-12 w-full items-center justify-center border border-gold/50 px-5 font-sans text-[0.6875rem] tracking-[0.25em] uppercase text-gold transition-colors duration-500 enabled:hover:border-gold enabled:hover:bg-gold/10 enabled:hover:text-parchment disabled:opacity-35";
  const quietLink =
    "font-sans text-[0.6875rem] tracking-[0.2em] uppercase text-cream/50 underline decoration-cream/20 underline-offset-4 transition-colors duration-300 hover:text-cream";

  /* The four moons — where the guest stands in the flow. */
  const stepIndex = { plan: 0, book: 1, details: 2, done: 3 }[screen];
  const moons = (
    <div aria-hidden className="mt-8 flex items-center justify-center gap-2.5">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
            i <= stepIndex ? "bg-gold" : "bg-cream/15"
          }`}
        />
      ))}
    </div>
  );

  /* ── the ceremony (screen 4) ─────────────────────────────────────── */

  if (screen === "done") {
    return (
      <div className="reserve-screen mx-auto w-full max-w-md px-6 pb-24 pt-12 text-center">
        <MoonGate date={date} time={hour} party={party} filled />
        <p className="eyebrow mt-10">Your reservation</p>
        <h1 className="mt-4 font-serif text-[2.375rem] leading-tight text-parchment">
          The table is <em className="text-clay">set.</em>
        </h1>
        <p className="mt-3 font-serif text-base italic leading-relaxed text-cream/70">
          {name.trim() ? `${name.trim().split(" ")[0]}, the` : "The"} house is
          expecting you.
        </p>

        <dl className="mt-10 space-y-3.5 border-y border-gold/20 py-7 text-left">
          {[
            ["Evening", date ? speakDate(date) : "—"],
            ["Hour", hour ? fmtSlot(hour) : "—"],
            ["Party", speakParty(party)],
            ["Seating", seating === "madams" ? "Madam's Room" : "Chosen by the house"],
            ["Reference", "LD-8R2N"], // sample data
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4">
              <dt className="font-sans text-[0.625rem] tracking-[0.25em] uppercase text-gold/80">
                {k}
              </dt>
              <dd className="font-serif text-lg text-cream">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 text-left">
          <p className="font-sans text-[0.625rem] tracking-[0.25em] uppercase text-gold/80">
            What happens next
          </p>
          <p className="mt-2.5 font-sans text-sm leading-relaxed text-cream/70">
            Nothing is asked of you. The family holds this table for two hours
            from your chosen hour. If your evening changes, the link in your
            confirmation lets you release it — or telephone the house:{" "}
            {PHONE_DISPLAY}.
          </p>
        </div>

        <Link
          href="/"
          className="mt-12 inline-flex min-h-11 items-center border border-gold/40 px-5 font-sans text-[0.6875rem] tracking-[0.25em] uppercase text-gold transition-colors duration-500 hover:border-gold hover:text-parchment"
        >
          Return to the garden
        </Link>
      </div>
    );
  }

  /* ── the flow (screens 1–3) ──────────────────────────────────────── */

  return (
    <div className="mx-auto w-full max-w-md px-6 pb-24 pt-10">
      {/* threshold: back to the story, the medallion, where you stand */}
      <header className="text-center">
        <div className="flex items-center justify-between">
          <Link href="/" className={quietLink}>
            ← The garden
          </Link>
          <Image
            src="/web_assets/LD-logo-crop.svg"
            alt="Le Dalat"
            width={200}
            height={200}
            className="h-auto w-10 opacity-90"
          />
        </div>

        <div className="mt-10">
          <MoonGate
            date={date}
            time={hour}
            party={tooLarge ? null : party}
            consulting={screen === "book" && verdict === "consulting"}
          />
        </div>
        {moons}
      </header>

      {/* ── screen 1: the evening ── */}
      {screen === "plan" && (
        <section className="reserve-screen mt-10">
          <h1 className="text-center font-serif text-[2rem] leading-tight text-parchment">
            Choose your <em className="text-clay">evening.</em>
          </h1>

          <div className="mt-9">
            {eyebrowRow("I", "The evening")}
            <div className="-mx-6 mt-4 flex snap-x gap-2 overflow-x-auto px-6 pb-2">
              {days.map((d) => {
                const active = date === d.key;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => {
                      setDate(d.key);
                      setHour(null);
                    }}
                    className={`w-16 shrink-0 snap-start border py-3 text-center transition-colors duration-300 ${
                      active
                        ? "border-gold bg-gold/10"
                        : "border-cream/15 hover:border-gold/50"
                    }`}
                  >
                    <span className="block font-sans text-[0.5625rem] tracking-[0.2em] uppercase text-cream/50">
                      {d.weekday}
                    </span>
                    <span
                      className={`mt-1 block font-serif text-xl ${active ? "text-gold" : "text-cream"}`}
                    >
                      {d.day}
                    </span>
                    <span className="block font-sans text-[0.5625rem] tracking-[0.2em] uppercase text-cream/50">
                      {d.month}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-1 font-sans text-xs text-cream/40">
              Further ahead? The house takes the telephone for distant dates:{" "}
              {PHONE_DISPLAY}.
            </p>
          </div>

          <div className="mt-9">
            {eyebrowRow("II", "The party")}
            <div className="mt-5 flex items-center justify-center gap-6">
              <button
                type="button"
                aria-label="Fewer guests"
                onClick={() => setParty((p) => Math.max(1, p - 1))}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 text-lg text-cream transition-colors duration-300 hover:border-gold/60"
              >
                −
              </button>
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 font-serif text-[1.75rem] text-parchment">
                {tooLarge ? `${ONLINE_PARTY_MAX}+` : party}
              </span>
              <button
                type="button"
                aria-label="More guests"
                onClick={() => setParty((p) => Math.min(ONLINE_PARTY_MAX + 1, p + 1))}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 text-lg text-cream transition-colors duration-300 hover:border-gold/60"
              >
                +
              </button>
            </div>
          </div>

          {/* the warm large-party path — an invitation, never a rejection */}
          {tooLarge ? (
            <div className="reserve-screen mt-10 border border-gold/25 bg-black/25 p-6">
              <p className="eyebrow">A table of many</p>
              <h2 className="mt-3 font-serif text-2xl leading-snug text-parchment">
                Eleven or more is a <em className="text-clay">celebration.</em>
              </h2>
              <p className="mt-3 font-sans text-sm leading-relaxed text-cream/75">
                For a party this size the family arranges the room themselves —
                tables joined under the lamps, the private room, sometimes the
                whole garden. Telephone the house and it will be a pleasure to
                plan it with you.
              </p>
              <p className="mt-5 font-serif text-lg text-gold">{PHONE_DISPLAY}</p>
            </div>
          ) : (
            <>
              <div className="mt-9">
                {eyebrowRow("III", "The seating")}
                <div className="mt-4 grid grid-cols-1 gap-2">
                  {[
                    {
                      value: "house" as const,
                      title: "Wherever suits the evening",
                      line: "The house seats you where the night is best.",
                    },
                    {
                      value: "madams" as const,
                      title: "Madam's Room",
                      line: "The private room, for quieter occasions.",
                    },
                  ].map((opt) => {
                    const active = seating === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSeating(opt.value)}
                        className={`border px-4 py-3.5 text-left transition-colors duration-300 ${
                          active
                            ? "border-gold bg-gold/10"
                            : "border-cream/15 hover:border-gold/50"
                        }`}
                      >
                        <span className={`block font-serif text-base ${active ? "text-parchment" : "text-cream/90"}`}>
                          {opt.title}
                        </span>
                        <span className="mt-0.5 block font-sans text-xs text-cream/50">
                          {opt.line}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-9">
                {eyebrowRow("IV", "The hour")}
                {[
                  { label: "Lunch", slots: LUNCH_SLOTS },
                  { label: "Dinner", slots: DINNER_SLOTS },
                ].map((svc) => (
                  <div key={svc.label} className="mt-4">
                    <p className="font-sans text-[0.6875rem] tracking-[0.15em] uppercase text-cream/40">
                      {svc.label}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {svc.slots.map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={!date}
                          onClick={() => consult(s)}
                          className={`min-h-11 border px-3.5 font-sans text-[0.8125rem] tabular-nums transition-colors duration-300 disabled:opacity-30 ${
                            hour === s
                              ? "border-gold bg-gold/10 text-parchment"
                              : "border-cream/15 text-cream/85 enabled:hover:border-gold/50"
                          }`}
                        >
                          {fmtSlot(s)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {!date && (
                  <p className="mt-3 font-sans text-xs text-cream/40">
                    Choose an evening first — the hours will open.
                  </p>
                )}
              </div>
            </>
          )}
        </section>
      )}

      {/* ── screen 2: the book answers ── */}
      {screen === "book" && (
        <section className="reserve-screen mt-10 text-center" aria-live="polite">
          {verdict === "consulting" && (
            <>
              <h1 className="font-serif text-[1.75rem] leading-snug text-parchment">
                The book is <em className="text-clay">consulted…</em>
              </h1>
              <p className="mt-3 font-sans text-sm text-cream/55">
                {date && hour && `${speakDate(date)}, ${fmtSlot(hour)}, ${speakParty(party)}.`}
              </p>
            </>
          )}

          {verdict === "open" && (
            <>
              {/* the gate-green moment: jade appears ONLY here */}
              <p className="eyebrow" style={{ color: "var(--color-jade)" }}>
                The gates open
              </p>
              <h1 className="mt-4 font-serif text-[2rem] leading-tight text-parchment">
                {hour && fmtSlot(hour)} is <em className="text-clay">yours to take.</em>
              </h1>
              <p className="mt-3 font-sans text-sm leading-relaxed text-cream/70">
                {seating === "madams"
                  ? "The private room stands ready."
                  : "A table under the lamps awaits."}
              </p>
              <button type="button" onClick={() => setScreen("details")} className={`${primaryCta} mt-8`}>
                Continue
              </button>
              <p className="mt-6">
                <button type="button" onClick={() => setScreen("plan")} className={quietLink}>
                  Adjust the evening
                </button>
              </p>
            </>
          )}

          {verdict === "soldout" && (
            <>
              <h1 className="font-serif text-[2rem] leading-tight text-parchment">
                That hour is <em className="text-clay">fully seated.</em>
              </h1>
              <p className="mx-auto mt-3 max-w-xs font-sans text-sm leading-relaxed text-cream/70">
                The book fills quickly some evenings. Close by, the house can
                still offer:
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {MOCK_ALTERNATIVES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => consult(s)}
                    className="min-h-11 border border-gold/60 px-4 font-sans text-[0.8125rem] tabular-nums text-gold transition-colors duration-300 hover:bg-gold/10 hover:text-parchment"
                  >
                    {fmtSlot(s)}
                  </button>
                ))}
              </div>
              <p className="mt-7 font-sans text-xs leading-relaxed text-cream/45">
                Or another evening entirely — the fortnight is a step back. For
                anything the book cannot hold, telephone the house:{" "}
                {PHONE_DISPLAY}.
              </p>
              <p className="mt-6">
                <button type="button" onClick={() => setScreen("plan")} className={quietLink}>
                  Adjust the evening
                </button>
              </p>
            </>
          )}
        </section>
      )}

      {/* ── screen 3: your details ── */}
      {screen === "details" && (
        <section className="reserve-screen mt-10">
          <h1 className="text-center font-serif text-[2rem] leading-tight text-parchment">
            Who shall we <em className="text-clay">expect?</em>
          </h1>

          <div className="mt-8 grid grid-cols-1 gap-6">
            <label className="block">
              <span className={fieldLabel}>Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                autoComplete="name"
                placeholder="The name the table is held under"
                className={`${inputBox} ${touched.name && !nameOk ? "border-clay/70" : ""}`}
              />
              {touched.name && !nameOk && (
                <p className={softError}>A name, so the table knows its guest.</p>
              )}
            </label>

            <div>
              <span className={fieldLabel}>Telephone</span>
              <div className="mt-2 flex gap-1.5">
                <select
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value)}
                  aria-label="Country code"
                  className="border border-cream/15 bg-black/20 px-2 font-sans text-[0.9375rem] text-cream [color-scheme:dark] focus:border-gold/60 focus:outline-none"
                >
                  {PHONE_CODES.map((c) => (
                    <option key={c} value={c} className="bg-umber-deep">
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                  autoComplete="tel-national"
                  placeholder="81 234 5678"
                  className={`${inputBox} !mt-0 flex-1 ${touched.phone && !phoneOk ? "border-clay/70" : ""}`}
                />
              </div>
              {touched.phone && !phoneOk ? (
                <p className={softError}>That number does not look complete.</p>
              ) : (
                <p className="mt-2 font-sans text-xs text-cream/40">
                  The house knows its guests by telephone number.
                </p>
              )}
            </div>

            <label className="block">
              <span className={fieldLabel}>
                Email <span className="normal-case tracking-normal text-gold/50">· optional</span>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                autoComplete="email"
                placeholder="For your confirmation"
                className={`${inputBox} ${touched.email && !emailOk ? "border-clay/70" : ""}`}
              />
              {touched.email && !emailOk && (
                <p className={softError}>That email does not look complete.</p>
              )}
            </label>

            <label className="block">
              <span className={fieldLabel}>
                A note for the kitchen{" "}
                <span className="normal-case tracking-normal text-gold/50">· optional</span>
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Allergies, occasions, a favourite corner…"
                className={`${inputBox} resize-none`}
              />
            </label>
          </div>

          <button
            type="button"
            disabled={!detailsOk || settingTable}
            onClick={reserve}
            className={`${primaryCta} mt-9`}
          >
            {settingTable ? "Setting the table…" : "Reserve the table"}
          </button>
          <p className="mt-4 text-center font-sans text-xs leading-relaxed text-cream/45">
            No deposit, no account. The table is held for two hours.
          </p>
          <p className="mt-6 text-center">
            <button type="button" onClick={() => setScreen("plan")} className={quietLink}>
              Adjust the evening
            </button>
          </p>
        </section>
      )}
    </div>
  );
}
