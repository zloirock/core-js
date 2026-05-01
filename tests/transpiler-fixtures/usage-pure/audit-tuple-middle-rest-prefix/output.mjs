import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Middle rest, but index BEFORE the rest: `[number[], ...string[], boolean][0]` — should resolve to number[]
// (fixed slot before the rest, NOT past it). findTupleElement should not bail on index < restIndex.
type MidRestPrefix = [number[], ...string[], boolean];
declare const t: MidRestPrefix;
_atMaybeArray(_ref = t[0]).call(_ref, 0);