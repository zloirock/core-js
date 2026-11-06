import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// A bound computed key selects the same literal-object slot as a plain key.
// The nested static read stays native while the independent at call is served.
const dynamicKey = 'a';
const wrapper = {
  [dynamicKey]: Array
};
const {
  a: {
    from
  }
} = wrapper;
from;
_atMaybeArray(_ref = [1]).call(_ref, 0);