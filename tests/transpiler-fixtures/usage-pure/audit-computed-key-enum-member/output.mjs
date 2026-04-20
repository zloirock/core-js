var _ref;
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// computed key via enum member access: obj[Keys.A]. resolveComputedKeyName looks up
// the TSEnumDeclaration via findTypeDeclaration and maps the member to its literal
// initializer value — plugin then narrows `.at(0)` to the Array instance method
enum Keys {
  A = 'a',
}
const obj = {
  a: ['x']
};
_atMaybeArray(_ref = obj[Keys.A]).call(_ref, 0);