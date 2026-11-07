import { expect, test } from "bun:test";
import { renderTable } from "../swiftbar/.config/swiftbar/lib/tableimage.ts";

test("renders the AI USAGE card as a retina PNG", () => {
  const b = Buffer.from(renderTable({ connected: 2, attention: 1, rows: [
    { name: "Claude", nameColor: "#F2F2F7", five: { left: 69, color: "#FF9F0A" }, seven: null, status: "LOW", statusColor: "#FF9F0A" },
  ] }), "base64");
  expect([...b.subarray(0, 4)]).toEqual([137, 80, 78, 71]);
  expect(b.readUInt32BE(16)).toBe(824);
  expect(b.readUInt32BE(20)).toBeGreaterThan(200);
});
