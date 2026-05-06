import _globalThis from "@core-js/pure/actual/global-this";
import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// shorthand property in static-wrapper ObjectExpression: `{ Array }` is shorthand for
// `{ Array: Array }`. walker reads prop.key (Identifier name 'Array') and prop.value
// (Identifier reference to Array). The shorthand shape must classify the same as the
// explicit form for static-object descent. distinct prototype methods on later receiver
const Array = _globalThis.Array;
const wrapper = {
  Array
};
const from = _Array$from;
_atMaybeArray(_ref = from(['x'])).call(_ref, 0);