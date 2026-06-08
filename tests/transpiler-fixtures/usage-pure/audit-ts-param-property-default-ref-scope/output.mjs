import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
// polyfillable call in a TS parameter-property default. the memoize `var _ref` must hoist to an
// enclosing scope visible from the parameter - a body var is unreachable because parameter defaults
// evaluate in the parameter scope, not the body. regression: it used to land in the constructor
// body, which throws a ReferenceError once the parameter-property is desugared
class C {
  constructor(public x = _flatMaybeArray(_ref = [1, 2]).call(_ref)) {}
}
new C();