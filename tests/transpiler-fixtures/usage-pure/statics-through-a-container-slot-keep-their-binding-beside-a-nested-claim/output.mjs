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
const _ref = box.A;
const from = (e(), _Array$from);
const name = _nameMaybeFunction(_ref);
const {
  other: {
    q
  }
} = _ref;
const {
  all,
  name: label,
  more: {
    r
  } = {
    r: 6
  }
} = {
  all: _Promise$all,
  name: _nameMaybeFunction(_Promise),
  more: _Promise.more
};
const _ref2 = box.A;
const of = (e(), _Array$of);
const title = _nameMaybeFunction(_ref2);
const {
  last: {
    t
  } = {
    t: 7
  }
} = _ref2;
use(from, name, q, all, label, r, of, title, t);