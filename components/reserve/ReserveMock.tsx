"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LUNCH_SLOTS,
  DINNER_SLOTS,
  ONLINE_PARTY_MAX,
  PHONE_DISPLAY,
  SOLD_OUT_SLOT,
  MOCK_ALTERNATIVES,
  toDateKey,
  upcomingDays,
  speakDate,
  speakParty,
} from "@/lib/reserve-mock";

/**
 * GATE 5A REVISION — DESIGN MOCKUP, daylight edition. No Supabase, no
 * availability logic; hardcoded data and staged delays. Mock rule:
 * 7:30 pm is always "fully seated"; every other hour is free.
 *
 * The room: the homepage's parchment, medallion-navy ink, one question
 * per screen, the circle as the recurring motif. Jade appears only on
 * the single primary confirm and the success state; gold only as gilt —
 * an eyebrow, the seal's thin ring. The serif asks; the sans serves.
 */

type Step = "date" | "party" | "time" | "seating" | "details" | "done";
const STEPS: Step[] = ["date", "party", "time", "seating", "details", "done"];

type Consult = "idle" | "asking" | "soldout";

const PHONE_CODES = ["+66", "+1", "+33", "+44", "+65", "+81", "+86"];

/** Round medallion time label: serif figures, quiet meridiem. */
function slotParts(slot: string): { face: string; meridiem: "am" | "pm" } {
  const [h, m] = slot.split(":").map(Number);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return { face: `${h12}:${String(m).padStart(2, "0")}`, meridiem: h < 12 ? "am" : "pm" };
}

export default function ReserveMock({
  initialDate,
  initialParty,
}: {
  initialDate: string | null;
  initialParty: number | null;
}) {
  const [days] = useState(() => upcomingDays(new Date(), 14));

  // The bookable year: today through exactly twelve months ahead.
  const [{ todayKey, horizonKey, thisMonth }] = useState(() => {
    const now = new Date();
    return {
      todayKey: toDateKey(now),
      horizonKey: toDateKey(new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())),
      thisMonth: now.getFullYear() * 12 + now.getMonth(),
    };
  });
  const inHorizon = (key: string) => key >= todayKey && key <= horizonKey;

  const [step, setStep] = useState<Step>("date");
  const [date, setDate] = useState<string | null>(() =>
    initialDate && inHorizon(initialDate) ? initialDate : null,
  );
  /** The two layers of the date question: the fortnight, or the full year. */
  const [dateLayer, setDateLayer] = useState<"fortnight" | "calendar">(() =>
    initialDate && inHorizon(initialDate) && !days.some((d) => d.key === initialDate)
      ? "calendar"
      : "fortnight",
  );
  const [viewMonth, setViewMonth] = useState(() => {
    const seed =
      initialDate && inHorizon(initialDate) ? new Date(`${initialDate}T12:00:00`) : new Date();
    return seed.getFullYear() * 12 + seed.getMonth();
  });
  const [party, setParty] = useState(initialParty && initialParty >= 1 ? initialParty : 2);
  const [service, setService] = useState<"lunch" | "dinner">("dinner");
  const [slotPage, setSlotPage] = useState(0);
  const [hour, setHour] = useState<string | null>(null);
  const [consult, setConsult] = useState<Consult>("idle");
  const [seating, setSeating] = useState<"house" | "madams">("house");

  const [name, setName] = useState("");
  const [phoneCode, setPhoneCode] = useState("+66");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [settingTable, setSettingTable] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const later = (ms: number, fn: () => void) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(fn, ms);
  };

  const go = (next: Step) => {
    setStep(next);
    window.scrollTo({ top: 0 });
  };

  const tooLarge = party > ONLINE_PARTY_MAX;

  /* selections advance like turning a page — a beat to see the choice land */
  const chooseDate = (key: string) => {
    setDate(key);
    later(340, () => go("party"));
  };

  const chooseHour = (slot: string) => {
    setHour(slot);
    setConsult("asking");
    later(1200, () => {
      if (slot === SOLD_OUT_SLOT) {
        setConsult("soldout");
      } else {
        setConsult("idle");
        go("seating");
      }
    });
  };

  const chooseSeating = (value: "house" | "madams") => {
    setSeating(value);
    later(340, () => go("details"));
  };

  const reserve = () => {
    setSettingTable(true);
    later(1300, () => {
      setSettingTable(false);
      go("done");
    });
  };

  const phoneDigits = phone.replace(/\D/g, "");
  const nameOk = name.trim().length > 0;
  const phoneOk = phoneDigits.length >= 8 && phoneDigits.length <= 12;
  const emailOk = email.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const detailsOk = nameOk && phoneOk && emailOk;

  /* ── shared dressing ─────────────────────────────────────────────── */

  const eyebrow = "font-sans text-[0.625rem] tracking-[0.3em] uppercase text-gold";
  const question =
    "mt-4 font-serif text-[clamp(2.375rem,10vw,3rem)] font-medium leading-[1.1] text-navy";
  const hint = "font-sans text-[0.8125rem] leading-relaxed text-navy/55";
  const quietAction =
    "font-sans text-[0.6875rem] tracking-[0.22em] uppercase text-navy/70 underline decoration-navy/25 underline-offset-4 transition-colors duration-300 hover:text-navy";
  const chosen = date ? speakDate(date) : null;

  const backTo = (target: Step | "home", label = "Back") =>
    target === "home" ? (
      <Link href="/" className={quietAction}>
        ← The garden
      </Link>
    ) : (
      <button type="button" onClick={() => go(target)} className={quietAction}>
        ← {label}
      </button>
    );

  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="flex min-h-svh flex-col">
      {/* threshold: back affordance and the medallion */}
      <header className="mx-auto w-full max-w-md px-6 pt-6">
        <div className="flex items-center justify-between">
          {step === "done" ? (
            <span />
          ) : step === "date" ? (
            backTo("home")
          ) : (
            backTo(STEPS[stepIndex - 1])
          )}
          <Link href="/" aria-label="Return to the homepage">
            <Image
              src="/web_assets/LD-logo-crop.svg"
              alt="Le Dalat"
              width={200}
              height={200}
              className="h-auto w-11"
            />
          </Link>
        </div>
      </header>

      <main
        key={step}
        className="page-turn mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-12 text-center"
      >
        {/* ── I. the evening — the fortnight, or the full year ── */}
        {step === "date" && (
          <>
            <p className={eyebrow}>Reservations</p>
            <h1 className={question}>
              When shall we <em>expect you?</em>
            </h1>

            {dateLayer === "fortnight" ? (
              <div key="fortnight" className="page-turn">
                <div className="mt-10 grid grid-cols-7 gap-x-1.5 gap-y-4">
                  {days.map((d) => {
                    const active = date === d.key;
                    return (
                      <div key={d.key} className="flex flex-col items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => chooseDate(d.key)}
                          aria-label={speakDate(d.key)}
                          className={`flex h-11 w-11 items-center justify-center rounded-full font-serif text-[1.1875rem] transition-colors duration-300 ${
                            active ? "bg-navy text-parchment" : "text-navy hover:bg-navy/10"
                          }`}
                        >
                          {d.day}
                        </button>
                        <span className="font-sans text-[0.5625rem] tracking-[0.14em] uppercase text-navy/45">
                          {d.weekday}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="mt-10">
                  <button
                    type="button"
                    onClick={() => setDateLayer("calendar")}
                    className={quietAction}
                  >
                    Planning further ahead?
                  </button>
                </p>
              </div>
            ) : (
              <div key="calendar" className="page-turn mt-9 w-full max-w-xs">
                {/* one month at a time — the year is twelve pages */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    aria-label="Earlier month"
                    disabled={viewMonth <= thisMonth}
                    onClick={() => setViewMonth((m) => Math.max(thisMonth, m - 1))}
                    className="flex h-11 w-11 items-center justify-center text-lg text-navy/60 transition-colors hover:text-navy disabled:opacity-25"
                  >
                    ‹
                  </button>
                  <span className="font-serif text-2xl text-navy">
                    {new Date(Math.floor(viewMonth / 12), viewMonth % 12, 1).toLocaleString(
                      "en-GB",
                      { month: "long" },
                    )}{" "}
                    {Math.floor(viewMonth / 12)}
                  </span>
                  <button
                    type="button"
                    aria-label="Later month"
                    disabled={viewMonth >= thisMonth + 12}
                    onClick={() => setViewMonth((m) => Math.min(thisMonth + 12, m + 1))}
                    className="flex h-11 w-11 items-center justify-center text-lg text-navy/60 transition-colors hover:text-navy disabled:opacity-25"
                  >
                    ›
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-7 gap-x-0.5 gap-y-1.5">
                  {["M", "T", "W", "T", "F", "S", "S"].map((wd, i) => (
                    <span
                      key={`${wd}${i}`}
                      className="font-sans text-[0.5625rem] tracking-[0.14em] uppercase text-navy/40"
                    >
                      {wd}
                    </span>
                  ))}
                  {(() => {
                    const year = Math.floor(viewMonth / 12);
                    const month = viewMonth % 12;
                    const lead = (new Date(year, month, 1).getDay() + 6) % 7; // Monday first
                    const count = new Date(year, month + 1, 0).getDate();
                    return [
                      ...Array.from({ length: lead }, (_, i) => <span key={`lead-${i}`} />),
                      ...Array.from({ length: count }, (_, i) => {
                        const key = toDateKey(new Date(year, month, i + 1));
                        const open = inHorizon(key);
                        const active = date === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            disabled={!open}
                            onClick={() => chooseDate(key)}
                            aria-label={speakDate(key)}
                            className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full font-serif text-[1.1875rem] transition-colors duration-300 ${
                              active
                                ? "bg-navy text-parchment"
                                : open
                                  ? "text-navy hover:bg-navy/10"
                                  : "text-navy/25"
                            }`}
                          >
                            {i + 1}
                          </button>
                        );
                      }),
                    ];
                  })()}
                </div>

                <p className="mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setDateLayer("fortnight");
                      setViewMonth(thisMonth);
                    }}
                    className={quietAction}
                  >
                    Nearer dates
                  </button>
                </p>
              </div>
            )}
          </>
        )}

        {/* ── II. the party ── */}
        {step === "party" && (
          <>
            <p className={eyebrow}>{chosen}</p>
            <h1 className={question}>
              How many at <em>the table?</em>
            </h1>

            <div className="mt-12 flex items-center gap-8">
              <button
                type="button"
                aria-label="Fewer guests"
                onClick={() => setParty((p) => Math.max(1, p - 1))}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-navy/25 text-lg text-navy transition-colors duration-300 hover:border-navy/60"
              >
                −
              </button>
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full border border-navy/35">
                <span className="font-serif text-[3.25rem] leading-none text-navy">
                  {tooLarge ? `${ONLINE_PARTY_MAX}+` : party}
                </span>
                <span className="mt-1 font-sans text-[0.5625rem] tracking-[0.22em] uppercase text-navy/50">
                  {tooLarge || party > 1 ? "guests" : "guest"}
                </span>
              </div>
              <button
                type="button"
                aria-label="More guests"
                onClick={() => setParty((p) => Math.min(ONLINE_PARTY_MAX + 1, p + 1))}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-navy/25 text-lg text-navy transition-colors duration-300 hover:border-navy/60"
              >
                +
              </button>
            </div>

            {tooLarge ? (
              <div className="mt-10 max-w-sm">
                <p className="font-serif text-xl italic leading-relaxed text-navy">
                  Eleven or more is a celebration.
                </p>
                <p className={`mt-3 ${hint}`}>
                  For a party this size the family arranges the room
                  themselves — tables joined under the lamps, the private
                  room, sometimes the whole garden. Telephone the house and it
                  will be a pleasure to plan it with you.
                </p>
                <p className="mt-4 font-serif text-lg text-navy">{PHONE_DISPLAY}</p>
              </div>
            ) : (
              <button type="button" onClick={() => go("time")} className={`mt-12 ${quietAction}`}>
                Continue
              </button>
            )}
          </>
        )}

        {/* ── III. the hour ── */}
        {step === "time" && (
          <>
            <p className={eyebrow}>
              {chosen} · {speakParty(party)}
            </p>
            <h1 className={question}>
              What hour <em>suits?</em>
            </h1>

            {consult !== "soldout" && (
              <>
                {/* the two services — a quiet pair of words */}
                <div className="mt-9 flex items-center gap-7">
                  {(["lunch", "dinner"] as const).map((svc) => (
                    <button
                      key={svc}
                      type="button"
                      onClick={() => {
                        setService(svc);
                        setSlotPage(0);
                      }}
                      className={`border-b pb-1 font-sans text-[0.6875rem] tracking-[0.25em] uppercase transition-colors duration-300 ${
                        service === svc
                          ? "border-navy text-navy"
                          : "border-transparent text-navy/45 hover:text-navy/70"
                      }`}
                    >
                      {svc}
                    </button>
                  ))}
                </div>

                {/* hours as offerings — a handful at a time, round medallions */}
                {(() => {
                  const slots = service === "lunch" ? LUNCH_SLOTS : DINNER_SLOTS;
                  const pages: string[][] = [];
                  for (let i = 0; i < slots.length; i += 5) pages.push(slots.slice(i, i + 5));
                  const page = pages[Math.min(slotPage, pages.length - 1)];
                  return (
                    <div className="mt-8 flex items-center gap-3">
                      <button
                        type="button"
                        aria-label="Earlier hours"
                        disabled={slotPage === 0}
                        onClick={() => setSlotPage((p) => Math.max(0, p - 1))}
                        className={`text-lg text-navy/60 transition-colors hover:text-navy disabled:opacity-25 ${
                          pages.length > 1 ? "" : "invisible"
                        }`}
                      >
                        ‹
                      </button>
                      <div className="flex max-w-[17rem] flex-wrap items-center justify-center gap-2.5">
                        {page.map((s) => {
                          const parts = slotParts(s);
                          const active = hour === s;
                          return (
                            <button
                              key={s}
                              type="button"
                              disabled={consult === "asking"}
                              onClick={() => chooseHour(s)}
                              className={`flex h-[4.25rem] w-[4.25rem] flex-col items-center justify-center rounded-full border transition-colors duration-300 disabled:opacity-40 ${
                                active
                                  ? "border-navy bg-navy text-parchment"
                                  : "border-navy/30 text-navy hover:border-navy/70"
                              }`}
                            >
                              <span className="font-serif text-[1.1875rem] leading-none">
                                {parts.face}
                              </span>
                              <span
                                className={`mt-0.5 font-sans text-[0.5625rem] tracking-[0.18em] uppercase ${
                                  active ? "text-parchment/70" : "text-navy/50"
                                }`}
                              >
                                {parts.meridiem}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        aria-label="Later hours"
                        disabled={slotPage >= pages.length - 1}
                        onClick={() => setSlotPage((p) => p + 1)}
                        className={`text-lg text-navy/60 transition-colors hover:text-navy disabled:opacity-25 ${
                          pages.length > 1 ? "" : "invisible"
                        }`}
                      >
                        ›
                      </button>
                    </div>
                  );
                })()}

                {/* the designed wait — three quiet dots, no spinners */}
                <div className="mt-8 h-6" aria-live="polite">
                  {consult === "asking" && (
                    <span className="inline-flex items-center gap-2.5">
                      <span className={hint}>Asking the book</span>
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-1 w-1 animate-pulse rounded-full bg-navy/70"
                          style={{ animationDelay: `${i * 240}ms` }}
                        />
                      ))}
                    </span>
                  )}
                </div>
              </>
            )}

            {/* sold out — warm, with offerings close by */}
            {consult === "soldout" && (
              <div className="mt-9" aria-live="polite">
                <p className="font-serif text-xl italic leading-relaxed text-clay">
                  That hour is fully seated.
                </p>
                <p className={`mx-auto mt-2 max-w-xs ${hint}`}>
                  The book fills quickly some evenings. Close by, the house can
                  still offer:
                </p>
                <div className="mt-6 flex items-center justify-center gap-2.5">
                  {MOCK_ALTERNATIVES.map((s) => {
                    const parts = slotParts(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => chooseHour(s)}
                        className="flex h-[4.25rem] w-[4.25rem] flex-col items-center justify-center rounded-full border border-navy/60 text-navy transition-colors duration-300 hover:bg-navy hover:text-parchment"
                      >
                        <span className="font-serif text-[1.1875rem] leading-none">
                          {parts.face}
                        </span>
                        <span className="mt-0.5 font-sans text-[0.5625rem] tracking-[0.18em] uppercase opacity-60">
                          {parts.meridiem}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className={`mx-auto mt-7 max-w-xs ${hint}`}>
                  Or step back and choose another evening. For anything the
                  book cannot hold: {PHONE_DISPLAY}.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setConsult("idle");
                    setHour(null);
                  }}
                  className={`mt-6 ${quietAction}`}
                >
                  Choose a different hour
                </button>
              </div>
            )}
          </>
        )}

        {/* ── IV. the seating ── */}
        {step === "seating" && (
          <>
            <p className={eyebrow}>
              {chosen} ·{" "}
              {hour && `${slotParts(hour).face} ${slotParts(hour).meridiem}`}
            </p>
            <h1 className={question}>
              Where shall we <em>seat you?</em>
            </h1>

            <div className="mt-11 flex flex-col items-center gap-7">
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
                    onClick={() => chooseSeating(opt.value)}
                    className="group flex max-w-sm flex-col items-center"
                  >
                    <span
                      aria-hidden
                      className={`mb-3 h-3.5 w-3.5 rounded-full border transition-colors duration-300 ${
                        active
                          ? "border-navy bg-navy"
                          : "border-navy/40 group-hover:border-navy"
                      }`}
                    />
                    <span className="font-serif text-2xl leading-snug text-navy">
                      {opt.title}
                    </span>
                    <span className={`mt-1 ${hint}`}>{opt.line}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── V. your details ── */}
        {step === "details" && (
          <>
            <p className={eyebrow}>
              {chosen} ·{" "}
              {hour && `${slotParts(hour).face} ${slotParts(hour).meridiem}`} ·{" "}
              {speakParty(party)}
            </p>
            <h1 className={question}>
              Who shall we <em>expect?</em>
            </h1>

            <div className="mt-10 w-full max-w-xs text-left">
              <label className="block">
                <span className="font-sans text-[0.625rem] tracking-[0.25em] uppercase text-navy/60">
                  Name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  autoComplete="name"
                  placeholder="The name the table is held under"
                  className={`mt-1.5 w-full border-b bg-transparent pb-2 font-serif text-lg text-navy placeholder:font-sans placeholder:text-[0.8125rem] placeholder:text-navy/35 focus:outline-none ${
                    touched.name && !nameOk
                      ? "border-clay/70"
                      : "border-navy/25 focus:border-navy/70"
                  }`}
                />
                {touched.name && !nameOk && (
                  <p className="mt-1.5 font-sans text-xs text-clay">
                    A name, so the table knows its guest.
                  </p>
                )}
              </label>

              <div className="mt-7">
                <span className="font-sans text-[0.625rem] tracking-[0.25em] uppercase text-navy/60">
                  Telephone
                </span>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <select
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    aria-label="Country code"
                    className="border-b border-navy/25 bg-transparent pb-2 font-serif text-lg text-navy focus:border-navy/70 focus:outline-none"
                  >
                    {PHONE_CODES.map((c) => (
                      <option key={c} value={c}>
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
                    className={`w-full border-b bg-transparent pb-2 font-serif text-lg text-navy placeholder:font-sans placeholder:text-[0.8125rem] placeholder:text-navy/35 focus:outline-none ${
                      touched.phone && !phoneOk
                        ? "border-clay/70"
                        : "border-navy/25 focus:border-navy/70"
                    }`}
                  />
                </div>
                {touched.phone && !phoneOk ? (
                  <p className="mt-1.5 font-sans text-xs text-clay">
                    That number does not look complete.
                  </p>
                ) : (
                  <p className="mt-1.5 font-sans text-xs text-navy/45">
                    The house knows its guests by telephone number.
                  </p>
                )}
              </div>

              <label className="mt-7 block">
                <span className="font-sans text-[0.625rem] tracking-[0.25em] uppercase text-navy/60">
                  Email{" "}
                  <span className="tracking-normal normal-case text-navy/40">· optional</span>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  autoComplete="email"
                  placeholder="For your confirmation"
                  className={`mt-1.5 w-full border-b bg-transparent pb-2 font-serif text-lg text-navy placeholder:font-sans placeholder:text-[0.8125rem] placeholder:text-navy/35 focus:outline-none ${
                    touched.email && !emailOk
                      ? "border-clay/70"
                      : "border-navy/25 focus:border-navy/70"
                  }`}
                />
                {touched.email && !emailOk && (
                  <p className="mt-1.5 font-sans text-xs text-clay">
                    That email does not look complete.
                  </p>
                )}
              </label>

              <label className="mt-7 block">
                <span className="font-sans text-[0.625rem] tracking-[0.25em] uppercase text-navy/60">
                  A note for the kitchen{" "}
                  <span className="tracking-normal normal-case text-navy/40">· optional</span>
                </span>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Allergies, occasions, a favourite corner…"
                  className="mt-1.5 w-full border-b border-navy/25 bg-transparent pb-2 font-serif text-lg text-navy placeholder:font-sans placeholder:text-[0.8125rem] placeholder:text-navy/35 focus:border-navy/70 focus:outline-none"
                />
              </label>

              {/* the single jade action */}
              <button
                type="button"
                disabled={!detailsOk || settingTable}
                onClick={reserve}
                className="mt-10 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-jade font-sans text-[0.6875rem] tracking-[0.25em] uppercase text-parchment transition-opacity duration-300 enabled:hover:opacity-90 disabled:opacity-35"
              >
                {settingTable ? "Setting the table…" : "Reserve the table"}
              </button>
              <p className="mt-3.5 text-center font-sans text-xs leading-relaxed text-navy/45">
                No deposit, no account. The table is held for two hours.
              </p>
            </div>
          </>
        )}

        {/* ── VI. the ceremony ── */}
        {step === "done" && (
          <>
            <p className={eyebrow}>Reservation received</p>
            <h1 className={question}>
              The table <em>is set.</em>
            </h1>
            <p className="mt-3 font-serif text-lg italic leading-relaxed text-jade">
              {name.trim() ? `${name.trim().split(" ")[0]}, the` : "The"} house is
              expecting you.
            </p>

            {/* the seal: the reference inside a drawn circle, gilt-ringed */}
            <div className="mt-10 flex h-36 w-36 items-center justify-center rounded-full border border-gold/70 p-2">
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-navy/15">
                <span className="font-serif text-2xl tracking-wide text-navy">LD-8R2N</span>
                <span className="mt-1 font-sans text-[0.5625rem] tracking-[0.25em] uppercase text-navy/50">
                  Reference
                </span>
              </div>
            </div>

            <dl className="mt-9 space-y-2.5">
              {[
                ["Evening", chosen ?? "—"],
                ["Hour", hour ? `${slotParts(hour).face} ${slotParts(hour).meridiem}` : "—"],
                ["Party", speakParty(party)],
                ["Seating", seating === "madams" ? "Madam's Room" : "Chosen by the house"],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col items-center">
                  <dt className="font-sans text-[0.5625rem] tracking-[0.25em] uppercase text-navy/45">
                    {k}
                  </dt>
                  <dd className="font-serif text-xl text-navy">{v}</dd>
                </div>
              ))}
            </dl>

            <p className={`mt-9 max-w-sm ${hint}`}>
              What happens next: nothing is asked of you. The family holds
              this table for two hours from your chosen hour. If your evening
              changes, the link in your confirmation lets you release it — or
              telephone the house: {PHONE_DISPLAY}.
            </p>

            <Link href="/" className={`mt-10 ${quietAction}`}>
              Return to the garden
            </Link>
          </>
        )}
      </main>

      {/* a row of small dots — nothing louder */}
      <footer aria-hidden className="flex justify-center gap-2 pb-8">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
              i <= stepIndex ? "bg-navy" : "bg-navy/20"
            }`}
          />
        ))}
      </footer>
    </div>
  );
}
