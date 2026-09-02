import _Array$from from "@core-js/pure/actual/array/from";
import _self from "@core-js/pure/actual/self";
const from = _Array$from;
// An optional connector directly on a proxy-global root is redundant once the root is substituted
// to the always-defined `_globalThis` (the `?.` guarded against an undefined global, which the
// polyfill never is). Both emitters normalize `globalThis?.self?.Array` to `_globalThis.Array`
// (collapsed `.self` hop, normalized leaf connector) - a deeper `?.` on an unknown leaf stays.
const {
  from: _unused,
  ...rest
} = _self.Array;
from([1]);