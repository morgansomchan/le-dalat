"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ScreenPhoto, { type PhotoKey } from "./ScreenPhoto";
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
 * delays; no Supabase, no availability logic. Mock rule: 7:30 pm is
 * always "fully seated" (the sold-out path); every other hour is free.
 *
 * The design: the homepage's own scene grammar carried into the flow.
 * Every screen is a full-bleed photograph of the house under the finale's
 * scrim, and the flow lives in the finale widget's glass card. Walking
 * the steps walks you deeper into the villa: the garden wall with its
 * round window → the lamplit bar → the painted walls → the laden table.
 */

type Screen = "plan" | "book" | "details" | "done";
type Verdict = "consulting" | "open" | "soldout";

const PHONE_CODES = ["+66", "+1", "+33", "+44", "+65", "+81", "+86"];

const SCREEN_PHOTO: Record<Screen, PhotoKey> = {
  plan: "garden",
  book: "bar",
  details: "mural",
  done: "feast",
};

export default function ReserveMock({
  initialDate,
  initialParty,
}: {
  initialDate: string | null;
  initialParty: number | null;
}) {
  const [days] = useState(() => upcomingDays(new Date(), 14));

  const [screen, setScreen] = useState<Screen>("plan");
  const [date, setDate] = useState<string | null>(() =>
    initialDate && days.some((d) => d.key === initialDate) ? initialDate : null,
  );
  const [party, setParty] = useState(initialParty && initialParty >= 1 ? initialParty : 2);
  const [seating, setSeating] = useState<"house" | "madams">("house");
  const [hour, setHour] = useState<string | null>(null);

  const [verdict, setVerdict] = useState<Verdict>("consulting");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [name, setName] = useState("");
  const [phoneCode, setPhoneCode] = useState("+66");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [settingTable, setSettingTable] = useState(false);

  const tooLarge = party > ONLINE_PARTY_MAX;

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const go = (next: Screen) => {
    setScreen(next);
    window.scrollTo({ top: 0 });
  };

  /** Ask the book (mock): a held breath, then the verdict. */
  const consult = (forHour: string) => {
    setHour(forHour);
    setScreen("book");
    window.scrollTo({ top: 0 });
    setVerdict("consulting");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setVerdict(forHour === SOLD_OUT_SLOT ? "soldout" : "open");
    }, 1400);
  };

  /** The final promise (mock): the table is set after a slow beat. */
  const reserve = () => {
    setSettingTable(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setSettingTable(false);
      go("done");
    }, 1400);
  };

  const phoneDigits = phone.replace(/\D/g, "");
  const nameOk = name.trim().length > 0;
  const phoneOk = phoneDigits.length >= 8 && phoneDigits.length <= 12;
  const emailOk = email.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const detailsOk = nameOk && phoneOk && emailOk;

  /* ── shared dressing (the finale widget's glass card language) ─────── */

  const glassCard =
    "border border-gold/25 bg-black/40 p-6 backdrop-blur-md sm:p-7";
  const fieldLabel = "font-sans text-[0.625rem] tracking-[0.25em] uppercase text-gold";
  const inputBox =
    "mt-2 w-full border border-cream/20 bg-black/20 px-3.5 py-3 font-sans text-[0.9375rem] text-cream [color-scheme:dark] placeholder:text-cream/30 focus:border-gold/60 focus:outline-none transition-colors duration-300";
  const softError = "mt-2 font-sans text-xs leading-relaxed text-clay";
  const primaryCta =
    "inline-flex min-h-12 w-full items-center justify-center border border-gold/50 px-5 font-sans text-[0.6875rem] tracking-[0.25em] uppercase text-gold transition-colors duration-500 enabled:hover:border-gold enabled:hover:bg-gold/10 enabled:hover:text-parchment disabled:opacity-35";
  const quietLink =
    "font-sans text-[0.6875rem] tracking-[0.2em] uppercase text-cream/60 underline decoration-cream/20 underline-offset-4 transition-colors duration-300 hover:text-cream";

  const header = (
    <header className="flex items-center justify-between">
      <Link href="/" className={quietLink}>
        ← The garden
      </Link>
      <Image
        src="/web_assets/LD-logo-crop.svg"
        alt="Le Dalat"
        width={200}
        height={200}
        className="h-auto w-11 opacity-95"
      />
    </header>
  );

  return (
    <div className="relative min-h-svh">
      <ScreenPhoto active={SCREEN_PHOTO[screen]} />

      <div className="mx-auto flex min-h-svh w-full max-w-md flex-col px-5 pb-16 pt-6 sm:max-w-lg">
        {header}

        {/* ── screen 1: the evening ── */}
        {screen === "plan" && (
          <section className="reserve-screen mt-10 sm:mt-14">
            <p className="eyebrow">Reservations</p>
            <h1 className="mt-3 font-serif text-[clamp(2.25rem,9vw,3rem)] leading-[1.08] text-parchment">
              Choose your
              <br />
              <em className="text-gold">evening.</em>
            </h1>

            <div className={`${glassCard} mt-8`}>
              <p className={fieldLabel}>The evening</p>
              <div className="-mx-6 mt-3 flex snap-x gap-2 overflow-x-auto px-6 pb-1 sm:-mx-7 sm:px-7">
                {days.map((d) => {
                  const active = date === d.key;
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => setDate(d.key)}
                      className={`w-[3.75rem] shrink-0 snap-start border py-2.5 text-center transition-colors duration-300 ${
                        active
                          ? "border-gold bg-gold/15"
                          : "border-cream/20 bg-black/20 hover:border-gold/50"
                      }`}
                    >
                      <span className="block font-sans text-[0.5625rem] tracking-[0.18em] uppercase text-cream/55">
                        {d.weekday}
                      </span>
                      <span
                        className={`block font-serif text-[1.375rem] leading-snug ${active ? "text-gold" : "text-cream"}`}
                      >
                        {d.day}
                      </span>
                      <span className="block font-sans text-[0.5625rem] tracking-[0.18em] uppercase text-cream/55">
                        {d.month}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between gap-4">
                <p className={fieldLabel}>Guests</p>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    aria-label="Fewer guests"
                    onClick={() => setParty((p) => Math.max(1, p - 1))}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/25 text-lg text-cream transition-colors duration-300 hover:border-gold/60"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-serif text-[1.625rem] text-parchment">
                    {tooLarge ? `${ONLINE_PARTY_MAX}+` : party}
                  </span>
                  <button
                    type="button"
                    aria-label="More guests"
                    onClick={() => setParty((p) => Math.min(ONLINE_PARTY_MAX + 1, p + 1))}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/25 text-lg text-cream transition-colors duration-300 hover:border-gold/60"
                  >
                    +
                  </button>
                </div>
              </div>

              {tooLarge ? (
                /* the warm large-party path — an invitation, never a rejection */
                <div className="reserve-screen mt-6 border-t border-gold/20 pt-5">
                  <h2 className="font-serif text-xl leading-snug text-parchment">
                    Eleven or more is <em className="text-gold">a celebration.</em>
                  </h2>
                  <p className="mt-2.5 font-sans text-sm leading-relaxed text-cream/75">
                    For a party this size the family arranges the room
                    themselves — tables joined under the lamps, the private
                    room, sometimes the whole garden. Telephone the house and
                    it will be a pleasure to plan it with you.
                  </p>
                  <p className="mt-4 font-serif text-lg text-gold">{PHONE_DISPLAY}</p>
                </div>
              ) : (
                <>
                  <div className="mt-6">
                    <p className={fieldLabel}>Seating</p>
                    <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {[
                        { value: "house" as const, title: "Wherever suits the evening" },
                        { value: "madams" as const, title: "Madam's Room · private" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSeating(opt.value)}
                          className={`min-h-11 border px-3.5 py-2.5 text-left font-sans text-[0.8125rem] transition-colors duration-300 ${
                            seating === opt.value
                              ? "border-gold bg-gold/15 text-parchment"
                              : "border-cream/20 bg-black/20 text-cream/85 hover:border-gold/50"
                          }`}
                        >
                          {opt.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className={fieldLabel}>The hour</p>
                    {[
                      { label: "Lunch", slots: LUNCH_SLOTS },
                      { label: "Dinner", slots: DINNER_SLOTS },
                    ].map((svc) => (
                      <div key={svc.label} className="mt-3">
                        <p className="font-sans text-[0.6875rem] tracking-[0.15em] uppercase text-cream/45">
                          {svc.label}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {svc.slots.map((s) => (
                            <button
                              key={s}
                              type="button"
                              disabled={!date}
                              onClick={() => consult(s)}
                              className={`min-h-11 border px-3 font-sans text-[0.8125rem] tabular-nums transition-colors duration-300 disabled:opacity-30 ${
                                hour === s
                                  ? "border-gold bg-gold/15 text-parchment"
                                  : "border-cream/20 bg-black/20 text-cream/85 enabled:hover:border-gold/50"
                              }`}
                            >
                              {fmtSlot(s)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {!date && (
                      <p className="mt-3 font-sans text-xs text-cream/45">
                        Choose an evening first — the hours will open.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            <p className="mt-4 font-sans text-xs leading-relaxed text-cream/50">
              Further ahead than the fortnight? The house takes the telephone
              for distant dates: {PHONE_DISPLAY}.
            </p>
          </section>
        )}

        {/* ── screen 2: the book answers ── */}
        {screen === "book" && (
          <section className="reserve-screen mt-10 sm:mt-14" aria-live="polite">
            {verdict === "consulting" && (
              <>
                <p className="eyebrow">One moment</p>
                <h1 className="mt-3 font-serif text-[clamp(2.25rem,9vw,3rem)] leading-[1.08] text-parchment">
                  Asking <em className="text-gold">the book…</em>
                </h1>
                <div className={`${glassCard} mt-8`}>
                  <p className="font-serif text-lg leading-relaxed text-cream">
                    {date && hour &&
                      `${speakDate(date)} · ${fmtSlot(hour)} · ${speakParty(party)}`}
                  </p>
                  {/* the designed wait: three lantern dots, no spinners */}
                  <div className="mt-5 flex gap-2" aria-label="Checking availability">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold"
                        style={{ animationDelay: `${i * 260}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {verdict === "open" && (
              <>
                {/* the gate-green moment — jade appears only here */}
                <p className="eyebrow" style={{ color: "var(--color-jade)" }}>
                  The gates open
                </p>
                <h1 className="mt-3 font-serif text-[clamp(2.25rem,9vw,3rem)] leading-[1.08] text-parchment">
                  {hour && fmtSlot(hour)} is
                  <br />
                  <em className="text-gold">yours to take.</em>
                </h1>
                <div className={`${glassCard} mt-8`}>
                  <p className="font-serif text-lg leading-relaxed text-cream">
                    {date && speakDate(date)} · {speakParty(party)}
                  </p>
                  <p className="mt-1.5 font-sans text-sm text-cream/70">
                    {seating === "madams"
                      ? "The private room stands ready."
                      : "A table under the lamps awaits."}
                  </p>
                  <button type="button" onClick={() => go("details")} className={`${primaryCta} mt-6`}>
                    Continue
                  </button>
                  <p className="mt-4 text-center">
                    <button type="button" onClick={() => go("plan")} className={quietLink}>
                      Adjust the evening
                    </button>
                  </p>
                </div>
              </>
            )}

            {verdict === "soldout" && (
              <>
                <p className="eyebrow">Spoken for</p>
                <h1 className="mt-3 font-serif text-[clamp(2.25rem,9vw,3rem)] leading-[1.08] text-parchment">
                  That hour is
                  <br />
                  <em className="text-gold">fully seated.</em>
                </h1>
                <div className={`${glassCard} mt-8`}>
                  <p className="font-sans text-sm leading-relaxed text-cream/80">
                    The book fills quickly some evenings. Close by, the house
                    can still offer:
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
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
                  <p className="mt-5 font-sans text-xs leading-relaxed text-cream/55">
                    Or another evening entirely. For anything the book cannot
                    hold, telephone the house: {PHONE_DISPLAY}.
                  </p>
                  <p className="mt-4 text-center">
                    <button type="button" onClick={() => go("plan")} className={quietLink}>
                      Adjust the evening
                    </button>
                  </p>
                </div>
              </>
            )}
          </section>
        )}

        {/* ── screen 3: your details ── */}
        {screen === "details" && (
          <section className="reserve-screen mt-10 sm:mt-14">
            <p className="eyebrow">Nearly there</p>
            <h1 className="mt-3 font-serif text-[clamp(2.25rem,9vw,3rem)] leading-[1.08] text-parchment">
              Who shall we <em className="text-gold">expect?</em>
            </h1>
            <p className="mt-3 font-sans text-sm text-cream/70">
              {date && hour && `${speakDate(date)} · ${fmtSlot(hour)} · ${speakParty(party)}`}
            </p>

            <div className={`${glassCard} mt-8`}>
              <div className="grid grid-cols-1 gap-5">
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
                      className="border border-cream/20 bg-black/20 px-2 font-sans text-[0.9375rem] text-cream [color-scheme:dark] focus:border-gold/60 focus:outline-none"
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
                    <p className="mt-2 font-sans text-xs text-cream/45">
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
                className={`${primaryCta} mt-7`}
              >
                {settingTable ? "Setting the table…" : "Reserve the table"}
              </button>
              <p className="mt-3.5 text-center font-sans text-xs leading-relaxed text-cream/50">
                No deposit, no account. The table is held for two hours.
              </p>
              <p className="mt-4 text-center">
                <button type="button" onClick={() => go("plan")} className={quietLink}>
                  Adjust the evening
                </button>
              </p>
            </div>
          </section>
        )}

        {/* ── screen 4: the ceremony ── */}
        {screen === "done" && (
          <section className="reserve-screen mt-10 text-center sm:mt-14">
            <p className="eyebrow">Reservation received</p>
            <h1 className="mt-3 font-serif text-[clamp(2.5rem,10vw,3.25rem)] leading-[1.08] text-parchment">
              The table is <em className="text-gold">set.</em>
            </h1>
            <p className="mt-3 font-serif text-base italic leading-relaxed text-cream/80">
              {name.trim() ? `${name.trim().split(" ")[0]}, the` : "The"} house is
              expecting you.
            </p>

            <div className={`${glassCard} mt-8 text-left`}>
              <dl className="space-y-3">
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
              <div className="mt-5 border-t border-gold/20 pt-4">
                <p className="font-sans text-[0.625rem] tracking-[0.25em] uppercase text-gold/80">
                  What happens next
                </p>
                <p className="mt-2 font-sans text-sm leading-relaxed text-cream/75">
                  Nothing is asked of you. The family holds this table for two
                  hours from your chosen hour. If your evening changes, the
                  link in your confirmation lets you release it — or telephone
                  the house: {PHONE_DISPLAY}.
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="mt-10 inline-flex min-h-11 items-center border border-gold/40 px-5 font-sans text-[0.6875rem] tracking-[0.25em] uppercase text-gold transition-colors duration-500 hover:border-gold hover:text-parchment"
            >
              Return to the garden
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
