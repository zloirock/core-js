// when an injected binding name (e.g. `_at`) appears as a substring of a longer user
// identifier (`_at`, `at_value`), nth-occurrence counting must stay correct: count against
// the ORIGINAL source slice (no bindings yet), not the composed content, else overlapping
// user identifiers mis-target sites. distinct methods per line so the diff pins the failure.
const _at = 1;
const at_value = 2;
const r1 = arr.at(0);
const r2 = arr.flat();
const r3 = arr.includes(1);
