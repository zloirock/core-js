import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
// an instance method under two array levels extracts off its captured element where the outer element runs
// an effect ahead of the inner array, the capture keeping the effect where the source wrote it: as a
// sequence, as the fresh-object left of a `||`, and in a decided arm
const [[_ref]] = [(mark(), [[]])];
const at = _atMaybeArray(_ref);
export { at };
const [[_ref2]] = [(mark(), [[]]) || [user]];
const toReversed = _toReversedMaybeArray(_ref2);
export { toReversed };
const [[_ref3]] = [(mark(), [[]])];
const findLast = _findLastMaybeArray(_ref3);
export { findLast };