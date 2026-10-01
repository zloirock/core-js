import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Multiple computed-key extractions retain their declaration order and TDZs.
// Each source is captured before its key effect; a plain following initializer stays last.
const _ref = arr,
  a = null == _ref ? _ref[""] : (e1(), _at(_ref)),
  _ref2 = arr2,
  f = null == _ref2 ? _ref2[""] : (e2(), _flatMaybeArray(_ref2));
const _ref3 = arr3,
  i = null == _ref3 ? _ref3[""] : (e3(), _includes(_ref3)),
  plain = 5;
console.log(a, f, i, plain);