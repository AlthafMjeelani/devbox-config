import { expect, test } from "bun:test";
import { renderBar } from "../swiftbar/.config/swiftbar/lib/barimage.ts";

test("renders a valid retina PNG, 36px tall", () => {
  const b = Buffer.from(renderBar([{ color: "#C084FC", used: 75, letter: "C" }, { color: "#5E9BFF", used: null, letter: "X" }]), "base64");
  expect([...b.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  expect(b.readUInt32BE(20)).toBe(36);
  expect(b.readUInt32BE(16)).toBeGreaterThan(100);
  expect(b.includes(Buffer.from("pHYs"))).toBe(true);
});
