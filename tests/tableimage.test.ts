import { expect, test } from "bun:test";
import { cardSize, renderCard } from "../swiftbar/.config/swiftbar/lib/tableimage.ts";
import { creditsCard } from "../swiftbar/.config/swiftbar/lib/aiusage.ts";

const png = (b64: string) => Buffer.from(b64, "base64");
const rows = [
  { name: "Claude", status: "HIGH BURN", statusColor: "#FF9F0A", windows: [
    { label: "5h", left: 68, color: "#30D158", detail: "2h 4m · today 15:09" },
    { label: "7d", left: 49, color: "#FF9F0A", detail: "4d 12h · Tue 24 Nov 01:29" },
  ] },
  { name: "Amp", status: "--", statusColor: "#8E8E93", windows: [{ label: "Quota", left: null, color: "#8E8E93", detail: "no reset time" }] },
];

test("renders the AI USAGE card as a retina PNG sized to its content", () => {
  const b = png(renderCard({ connected: 2, attention: 1, rows, credits: null }));
  expect([...b.subarray(0, 4)]).toEqual([137, 80, 78, 71]);
  expect(b.readUInt32BE(16)).toBe(824);
  expect(b.readUInt32BE(20)).toBe(cardSize(2, false).height * 2);
});

test("adds the reset credits panel with chips", () => {
  const credits = { available: 2, next: "next expires in 12d 13h · Wed 02 Dec 02:48", chips: ["Wed 02 Dec · 12d", "Sun 13 Dec · 23d"] };
  const b = png(renderCard({ connected: 2, attention: 0, rows, credits }));
  expect(b.readUInt32BE(20)).toBe(cardSize(2, true).height * 2);
  expect(cardSize(2, true).height).toBeGreaterThan(cardSize(2, false).height);
});

test("credits panel data from codex-resets", () => {
  const now = new Date(2026, 10, 19, 13, 0).getTime();
  const iso = (d: number) => new Date(2026, 11, d, 2, 48).toISOString();
  const c = creditsCard([{ account: "a", available: 2, credits: [{ grantedAt: null, expiresAt: iso(13) }, { grantedAt: null, expiresAt: iso(2) }] }], now);
  expect(c.available).toBe(2);
  expect(c.next).toBe("next expires in 12d 13h · Wed 02 Dec 02:48");
  expect(c.chips).toEqual(["Wed 02 Dec · 12d", "Sun 13 Dec · 23d"]);
  expect(creditsCard([{ account: "a", available: null, credits: [], error: "x" }], now).next).toBe("could not load credits");
  expect(creditsCard([{ account: "a", available: 0, credits: [] }], now).next).toBe("no credits to expire");
});
