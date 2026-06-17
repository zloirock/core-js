import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// computed key via enum member: `obj[Keys.A]` resolves to a statically-known string literal
// through the enum's member initialiser. plugin picks up the narrowed string value, which
// then narrows `.at(0)` on the looked-up array to the Array-specific polyfill
enum Keys {
  A = 'a',
}
const obj = {
  a: ['x']
};
_atMaybeArray(_ref = obj[Keys.A]).call(_ref, 0);