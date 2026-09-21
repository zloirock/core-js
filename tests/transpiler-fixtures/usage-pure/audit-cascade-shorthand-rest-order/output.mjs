import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
Symbol = _Symbol;
var _unused, _unused2;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
({
  Symbol: _unused,
  Array: _unused2,
  ...rest
} = _globalThis);
from = _Array$from;
export const viaShorthandRest = [from([1]), rest];
let al;
var _unused3;
al = _Iterator;
({
  Iterator: _unused3,
  ...others
} = _globalThis);
export const viaAliasedRest = [_Iterator.range(0, 3), others];