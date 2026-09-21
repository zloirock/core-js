import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A computed static key under an array wrapper and a nested computed instance key
// both receive polyfills. Each key effect runs once, before its corresponding source read.
let c1 = 0;
const [{
  [(c1++, 'from')]: from
}, other] = [{
  from: _Array$from
}, {}];
// nested-pattern variant with a plus-fold key on an instance method
let c2 = 0;
const arr = [1];
const {
    y: _ref
  } = {
    y: arr
  },
  _ref2 = _ref,
  at = null == _ref2 ? _ref2[""] : ((c2++, 'a') + 't', _atMaybeArray(_ref2));
export const r = [from, at, other, c1, c2];