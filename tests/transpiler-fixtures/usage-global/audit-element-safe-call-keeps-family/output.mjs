import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.with";
// a registry-known non-mutating method keeps the per-element precision - the read stays
// on the array family alone (the string leg must NOT appear)
const scanned = [[1], [2]];
scanned.forEach(f);
export const viaSafeCall = scanned[0].at(1);

// non-method member reads stay plain reads too - the string leg must not appear either
const measured = [[1], [2]];
use(measured.length, measured.custom);
export const viaPropertyReads = measured[0].includes(7);

// an optional-chained safe call keeps the family narrow the same way
const opted = [[1], [2]];
opted?.includes(9);
export const viaOptionalSafeCall = opted[0].at(3);

// a registry-safe copying method keeps the family narrow too
const copied = [[1], [2]];
use(copied.with(0, [9]));
export const viaCopyingMethod = copied[0].at(5);