import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A parameter-property default owns its receiver memo in a lexical expression activation.
// Constructor-body vars are invisible from parameters, and an enclosing var would be
// shared across reentrant constructions. The same source survives parameter lowering.
class C {
  constructor(public x = (() => {
    var _ref;
    return _flatMaybeArray(_ref = [1, 2]).call(_ref);
  })()) {}
}
new C();