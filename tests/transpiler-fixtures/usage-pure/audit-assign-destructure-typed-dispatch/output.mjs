import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
import _Object$keys from "@core-js/pure/actual/object/keys";
var _ref, _ref2, _ref3, _ref4;
// the `let x; ({ x } = Source)` destructure's own write is the aliasing event, not a
// disqualifying reassignment: the body-extract alias must register so receiver narrowing
// through the binding dispatches the TYPED instance variant (the registrar once counted
// the destructure's own assignment as a violation and fell back to the generic helper).
// a REAL later reassignment still disqualifies - the value may no longer be the static.
// the exclusion is by source-range containment of the destructure pattern, so it also holds
// for a NESTED assignment pattern where the bound name sits deeper inside the same pattern
let from;
from = _Array$from;
export const r1 = _atMaybeArray(_ref = from([1, 2])).call(_ref, 0);
let keys, rest;
var _unused;
keys = _Object$keys;
({
  keys: _unused,
  ...rest
} = Object);
export const r2 = _atMaybeArray(_ref2 = keys({
  a: 1
})).call(_ref2, 0);
let of2;
of2 = _Array$of;
of2 = somethingElse;
export const r3 = _at(_ref3 = of2(3)).call(_ref3, 0);
let from3;
from3 = _Array$from;
export const r4 = _includesMaybeArray(_ref4 = from3([1])).call(_ref4, 2);