import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// alias-chain: const A = Array -> const P = A.prototype -> P.at routed through Array-specific helper
const A = Array;
const P = A.prototype;
_atMaybeArray(P).call(P, 0);