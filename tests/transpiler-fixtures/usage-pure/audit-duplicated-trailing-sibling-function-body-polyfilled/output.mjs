import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Map from "@core-js/pure/actual/map/constructor";
// MULTI-declarator trailing-sibling extraction: a nested instance method binds as a TRAILING declarator
// (`..., m = _m(recv)`) because a preceding statement would TDZ-fault. the cloned receiver carries a
// FUNCTION value whose body references a polyfillable global / makes an instance call - the trailing
// clone must be re-traversed so those substitute (babel once left it raw here, unlike its single-
// declarator path; the node-walk did too). distinct multi-type instance methods per line.
const z = 1,
  {
    y: {
      at: _unused
    }
  } = {
    y: [() => _Map]
  },
  a = _atMaybeArray([() => _Map]);
const w = 2,
  {
    v: {
      includes: _unused2
    }
  } = {
    v: [() => {
      var _ref;
      return _flatMaybeArray(_ref = [1, 2]).call(_ref);
    }]
  },
  b = _includesMaybeArray([() => {
    var _ref2;
    return _flatMaybeArray(_ref2 = [1, 2]).call(_ref2);
  }]);
export const r = [z, w, a, b];