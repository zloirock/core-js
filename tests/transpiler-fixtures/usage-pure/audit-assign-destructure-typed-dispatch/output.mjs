import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
import _Object$keys from "@core-js/pure/actual/object/keys";
var _ref, _ref2, _ref3, _ref4, _unused;
// A destructuring assignment provides a type hint for later instance dispatch.
// A genuine reassignment widens that hint; literal wrappers keep native static reads.
let from;
from = _Array$from;
export const r1 = _atMaybeArray(_ref = from([1, 2])).call(_ref, 0);
let keys, rest;
keys = _Object$keys, {
  keys: _unused,
  ...rest
} = Object;
export const r2 = _atMaybeArray(_ref2 = keys({
  a: 1
})).call(_ref2, 0);
let of2;
of2 = _Array$of;
of2 = somethingElse;
export const r3 = _at(_ref3 = of2(3)).call(_ref3, 0);
let from3;
({
  a: {
    from: from3
  }
} = {
  a: Array
});
export const r4 = _includesMaybeArray(_ref4 = from3([1])).call(_ref4, 2);