import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _self from "@core-js/pure/actual/self";
// A stored navigation value keeps assignments and rewrites inside its sequence prefix.
// Parenthesized and unparenthesized values collapse to the same backed navigation leaf.
// Source optional checks remain observable; plain middle hops do not invent new guards.
let q;
const arr = [1];
export const ctorStatic = (q = (_atMaybeArray(arr).call(arr, 0), _self), _Number$MAX_SAFE_INTEGER);