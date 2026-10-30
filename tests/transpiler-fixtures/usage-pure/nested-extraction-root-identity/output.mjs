import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A written alias owns its user keys; a defaulted symbol leaf keeps the raw read.
let root = _globalThis;
root = foreign;
let method;
method = _at(root.y);
({
  [_Symbol$iterator]: method = fallback()
} = _globalThis.Array);