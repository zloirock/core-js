import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at2 from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// when an injected binding name (e.g. `_at`) appears as a substring of a longer user
// identifier (`_at`, `at_value`), nth-occurrence counting must stay correct: count against
// the ORIGINAL source slice (no bindings yet), not the composed content, else overlapping
// user identifiers mis-target sites. distinct methods per line so the diff pins the failure.
const _at = 1;
const at_value = 2;
const r1 = _at2(arr).call(arr, 0);
const r2 = _flatMaybeArray(arr).call(arr);
const r3 = _includes(arr).call(arr, 1);