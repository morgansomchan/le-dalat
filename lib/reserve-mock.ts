/**
 * GATE 5A — DESIGN MOCKUP DATA. Everything here is hardcoded sample
 * data; no Supabase, no backend, no real availability. The shapes echo
 * the real engine contract so the eventual wiring is a data swap.
 */

export const LUNCH_SLOTS = ["11:30", "12:00", "12:30", "13:00", "13:30"];
export const DINNER_SLOTS = ["17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];
export const ONLINE_PARTY_MAX = 10;

/* PLACEHOLDER — the family's number awaits confirmation (project_context). */
export const PHONE_DISPLAY = "+66 · — (number pending)";

/**
 * MOCK RULE (so every state is walkable): 7:30 pm is always fully
 * seated — pick it to see the sold-out path. Every other hour is free.
 */
export const SOLD_OUT_SLOT = "19:30";
export const MOCK_ALTERNATIVES = ["19:00", "20:00", "20:30"];

export function fmtSlot(slot: string): string {
  const [h, m] = slot.split(":").map(Number);
  const suffix = h < 12 ? "am" : "pm";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export interface DayOption {
  key: string; // yyyy-MM-dd
  weekday: string;
  day: number;
  month: string;
}

export function toDateKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** The next N evenings as pickable cards. */
export function upcomingDays(from: Date, count: number): DayOption[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    return {
      key: toDateKey(d),
      weekday: WEEKDAYS[d.getDay()],
      day: d.getDate(),
      month: MONTHS[d.getMonth()],
    };
  });
}

/** "Saturday 15 August" */
export function speakDate(key: string): string {
  const d = new Date(`${key}T12:00:00`);
  return `${WEEKDAYS_FULL[d.getDay()]} ${d.getDate()} ${MONTHS_FULL[d.getMonth()]}`;
}

/** "Sat 15 Aug" */
export function speakDateShort(key: string): string {
  const d = new Date(`${key}T12:00:00`);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function speakParty(n: number): string {
  const words = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  return `${words[n] ?? n} ${n === 1 ? "guest" : "guests"}`;
}

/** Sample booking behind /reservation/sample-token — hardcoded. */
export function sampleBooking() {
  const d = new Date();
  const evening = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 9);
  return {
    reference: "LD-4K7M",
    date: toDateKey(evening),
    time: "20:00",
    party: 4,
    name: "Alexandra", // sample guest — first name only, per privacy doctrine
    seating: "Chosen by the house",
  };
}
