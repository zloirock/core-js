import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// member-init alias of `Array.prototype`: `P.at(0)` routes through Array-specific helper
const P = Array.prototype;
_atMaybeArray(P).call(P, 0);