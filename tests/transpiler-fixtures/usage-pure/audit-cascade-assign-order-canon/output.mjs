import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Symbol from "@core-js/pure/actual/symbol";
var _ref, _ref2, _unused, _unused2;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let a, b;
({
  from: a,
  deep: {
    other: b
  }
} = {
  from: _Array$from,
  deep: Array.deep
});
use(a, b);
let s, f, x;
({
  Symbol: s,
  Array: {
    from: f
  },
  deep: {
    x
  }
} = {
  Symbol: _Symbol,
  Array: {
    from: _Array$from
  },
  deep: _globalThis.deep
});
use(s, f, x);
let g;
_ref = _globalThis.Array, g = _Array$of, {
  of: _unused,
  ...rest
} = _ref, _ref;
use(g, rest);
let inner;
_ref2 = _globalThis.Object, fromEntries = _Object$fromEntries, {
  fromEntries: _unused2,
  ...inner
} = _ref2, _ref2;
use(fromEntries, inner);