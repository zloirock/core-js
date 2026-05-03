// when a polyfill binding name (e.g. `_at`) appears as substring of a longer user
// identifier (e.g. `_at`, `at_value`), nth-occurrence counting must stay correct.
// nth is computed against the ORIGINAL source slice (no bindings yet), not the composed
// content - any future drift toward composed-content counting would mis-target sites
// where the user identifier overlaps the binding name. distinct methods per line so
// output diff identifies which case failed
const _at = 1;
const at_value = 2;
const r1 = arr.at(0);
const r2 = arr.flat();
const r3 = arr.includes(1);
