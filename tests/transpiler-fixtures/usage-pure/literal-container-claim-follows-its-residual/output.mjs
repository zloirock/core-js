import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// A literal container captures its nested receiver before reading native siblings.
// Effectful method keys and their reads stay between the preceding and following bindings.
const x0 = 1,
  {
    y: _ref
  } = {
    y: s
  },
  {
    other: {
      q
    }
  } = _ref,
  a = (e(), _at(_ref));
let {
    y: _ref2
  } = {
    y: 'ab'
  },
  {
    more: {
      r
    }
  } = _ref2,
  b = (e(), _includesMaybeString(_ref2)),
  x1 = 2;
var x2 = 3,
  {
    y: _ref3
  } = {
    y: [1]
  },
  {
    last: {
      t
    }
  } = _ref3,
  c = (e(), _fillMaybeArray(_ref3)),
  d = null == _ref3 ? _ref3[""] : (e(), _flatMaybeArray(_ref3));
use(x0, q, a, r, b, x1, x2, t, c, d);