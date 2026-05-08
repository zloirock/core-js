import _at from "@core-js/pure/actual/instance/at";
var _ref;
// Tuple `[boolean, ...string[], number]` indexed past a middle rest has ambiguous element type.
// Element resolution must bail so dispatch falls back to the generic instance polyfill.
type MidRest = [boolean, ...string[], number];
declare const t: MidRest;
_at(_ref = t[1]).call(_ref, 0);