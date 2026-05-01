import _at from "@core-js/pure/actual/instance/at";
var _ref;
// Leading rest: `[...string[], number]` — index past leading rest is ambiguous (rest length unknown).
// Code at line 1411-1412 should bail when restIndex !== -1 && restIndex !== elements.length-1 && index >= restIndex.
// For [...string[], number][0] — restIndex=0, index=0 — should bail (returns null for tuple element).
// dispatch should fall back to generic _at since element type is unknown
type LeadingRest = [...string[], number];
declare const t: LeadingRest;
_at(_ref = t[0]).call(_ref, 0);