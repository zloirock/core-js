import _at from "@core-js/pure/actual/instance/at";
var _ref;
// `o?.a` short-circuits to undefined (no throw) when o is null, so `??` may yield the
// string fallback: the member result is marked and must dispatch generically, not
// through an array-Maybe
declare const o: {
  a: number[];
} | null;
_at(_ref = o?.a ?? 'fallback').call(_ref, 0);