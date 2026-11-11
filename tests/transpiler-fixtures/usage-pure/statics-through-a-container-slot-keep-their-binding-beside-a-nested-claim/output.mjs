import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$all from "@core-js/pure/actual/promise/all";
// Captured statics and function-name leaves keep their bindings beside deeper native claims.
// Computed keys and nested defaults remain in source order.
const box = {
  A: Array,
  B: _Promise
};
const _ref = box.A,
  from = (e(), _Array$from),
  name = _nameMaybeFunction(_ref),
  {
    other: {
      q
    }
  } = _ref;
const _ref2 = box.B,
  all = _Promise$all,
  label = _nameMaybeFunction(_ref2),
  {
    more: {
      r
    } = {
      r: 6
    }
  } = _ref2;
const _ref3 = box.A,
  of = (e(), _Array$of),
  title = _nameMaybeFunction(_ref3),
  {
    last: {
      t
    } = {
      t: 7
    }
  } = _ref3;
use(from, name, q, all, label, r, of, title, t);