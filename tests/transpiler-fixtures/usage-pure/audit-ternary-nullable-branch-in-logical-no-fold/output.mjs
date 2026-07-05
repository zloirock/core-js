import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// the nullable-branch ternary fold drops a statically null arm, which is sound for the
// bare RECEIVER (a nullish receiver throws the same TypeError transformed or not) but not
// for an enclosing logical: `(c ? nums : null)` may still be null at runtime, so `??` must
// not fold to the Array survivor (generic dispatch). the bare ternary receiver keeps the
// Array narrow
declare const c: boolean;
declare const nums: number[];
_at(_ref = (c ? nums : null) ?? 'x').call(_ref, 0);
_includesMaybeArray(_ref2 = c ? nums : null).call(_ref2, 1);