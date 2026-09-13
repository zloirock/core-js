import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A computed static key under an array wrapper and a nested computed instance key
// both receive polyfills. Each key effect runs once, before its corresponding source read.
let c1 = 0;
const [_ref, _ref2] = [Array, {}],
  _ref3 = _ref,
  from = null == _ref3 ? _ref3[""] : (c1++, _Array$from),
  other = _ref2;
// nested-pattern variant with a plus-fold key on an instance method
let c2 = 0;
const arr = [1];
const {
    y: _ref4
  } = {
    y: arr
  },
  _ref5 = _ref4,
  at = null == _ref5 ? _ref5[""] : ((c2++, 'a') + 't', _atMaybeArray(_ref5));
export const r = [from, at, other, c1, c2];