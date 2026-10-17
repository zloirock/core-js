import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
// A `__proto__` literal entry sets the prototype instead of creating an own property.
// Keep the nested capture so its later pattern read observes `undefined`, not the initializer value.
const list = [[1]];
let at, proto;
_ref = {
  y: _flatMaybeArray(list).call(list),
  __proto__: null
};
at = _atMaybeArray(_ref.y);
({
  __proto__: proto
} = _ref);
export const result = [at.call([2], 0), proto];