import _at from "@core-js/pure/actual/instance/at";
var _ref;
// Tuple with a middle rest `[number, ...string[], boolean]` indexed at position 2:
// the slot could be either `string` (rest holds 2+ elements) or `boolean` (rest empty),
// so the type is ambiguous and `m[2].at(0)` emits the generic instance polyfill.
type Mixed = [number, ...string[], boolean];
declare const m: Mixed;
_at(_ref = m[2]).call(_ref, 0);