/**
 * Rate card sanity check — run `npm run rates`.
 *
 * Prints what the current rates.ts produces for a set of real Atlanta trips,
 * so a rate change can be eyeballed against what Craig actually charges before
 * it reaches a customer. Deliberately outside the `*.test.ts` glob: it asserts
 * nothing, it just reports.
 */

import { it } from "vitest";
import { calculateQuote, formatUSD } from "./quote";
import { vehicle } from "./rates";

const TRIPS: [string, number, number][] = [
  ["ATL → Downtown", 11, 18],
  ["ATL → Midtown", 13, 22],
  ["ATL → Buckhead", 16, 28],
  ["ATL → Buckhead (7am rush)", 16, 45],
  ["ATL → Sandy Springs", 22, 32],
  ["ATL → Marietta", 27, 38],
  ["ATL → Alpharetta", 35, 48],
  ["Buckhead → Midtown", 4, 12],
  ["Buckhead → PDK", 9, 17],
  ["ATL → Athens", 75, 85],
];

it("prints the rate card applied to sample trips", () => {
  const rows = TRIPS.map(([name, miles, minutes]) => {
    const airport = name.includes("ATL") || name.includes("PDK");
    const q = calculateQuote({
      tripType: "transfer",
      miles,
      durationMinutes: minutes,
      pickupAt: "2026-09-15T14:00",
      isAirport: airport,
    });
    const dist = vehicle.perMileRate * miles;
    const time = vehicle.perMinuteRate * minutes;
    return [
      name.padEnd(28),
      `${String(miles).padStart(3)}mi`,
      `${String(minutes).padStart(3)}min`,
      `dist ${formatUSD(dist).padStart(8)}`,
      `time ${formatUSD(time).padStart(7)}`,
      `sub ${formatUSD(q.subtotal).padStart(8)}`,
      `tip ${formatUSD(q.gratuity).padStart(7)}`,
      `TOTAL ${formatUSD(q.total).padStart(8)}`,
    ].join("  ");
  });
  console.log(
    `\n$${vehicle.perMileRate}/mi + $${vehicle.perMinuteRate}/min` +
      `  (base ${formatUSD(vehicle.baseFare)}, min fare ${formatUSD(vehicle.minimumFare)})\n\n` +
      rows.join("\n") +
      "\n",
  );
});
