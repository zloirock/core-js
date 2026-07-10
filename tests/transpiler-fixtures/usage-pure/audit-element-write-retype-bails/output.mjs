import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// element-type precision holds only while nothing can retype the elements between the
// array's creation and the read: an element write flips the family at runtime, so the
// read bails to the generic helper instead of keying a wrong-family Maybe (ie:11)
const written = [1, 2];
written[0] = 'x';
export const viaElementWrite = _at(_ref = written[0]).call(_ref, 0);

// a read-only-referenced literal keeps its per-element precision
const sealed = [[1], [2]];
export const viaSealedRead = _includesMaybeArray(_ref2 = sealed[0]).call(_ref2, 1);