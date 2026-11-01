import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// A stored environment probe retains the read of an excluded realm hop.
// Prefix, key and capture effects stay in place before the final write.
let held;
(held = _globalThis.window).self.slot = rhs();
(before(), held = _globalThis.window).self.slot = rhs();
(held = _globalThis.window)[key(), 'self'].slot = rhs();
(holder[_atMaybeArray(_ref = ['value']).call(_ref, 0)] = _globalThis.window).self.slot = _Array$from(values);
export { held };