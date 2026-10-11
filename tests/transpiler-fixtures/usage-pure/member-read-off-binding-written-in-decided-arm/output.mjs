import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// A member read off a binding written in an arm this build always takes reads the value that write
// stores, as a direct read of the binding does - braced in an `if` or spelled as a ternary arm. An
// undecided test keeps every value.
export function branch(source) {
  var _ref;
  let box = source;
  if (typeof _Promise != 'undefined') box = {
    data: 'abc'
  };else box = {
    data: [1]
  };
  return _atMaybeString(_ref = box.data).call(_ref, 0);
}
export function ternary(source) {
  var _ref2;
  let box = source;
  box = {
    data: 'abc'
  };
  return _includesMaybeString(_ref2 = box.data).call(_ref2, 'b');
}
export function undecided(source) {
  var _ref3;
  let box = source;
  _globalThis.flag ? box = {
    data: 'abc'
  } : box = {
    data: [1]
  };
  return _sliceMaybeArray(_ref3 = box.data).call(_ref3, 1);
}