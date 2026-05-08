import _at from "@core-js/pure/actual/instance/at";
var _ref;
// Tuple `[...string[], number]` indexed past the leading rest has ambiguous element type.
// Element resolution must bail so dispatch falls back to the generic instance polyfill.
type LeadingRest = [...string[], number];
declare const t: LeadingRest;
_at(_ref = t[0]).call(_ref, 0);