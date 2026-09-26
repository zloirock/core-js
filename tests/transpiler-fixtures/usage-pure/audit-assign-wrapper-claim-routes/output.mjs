import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
// An assignment under an array wrapper reads the paired element once. A flat method claim
// needs no object hop, while an optional hop still short-circuits as the source wrote it.
const log = [];
let flat, at, deep, kept, kw, named, keyed, other, stat, zn;
// A sole wrapper assigns its captured method after the native array step.
[_ref] = [_globalThis.Array.prototype];
// A neighbouring element binds after the first captured method read.
flat = _flatMaybeArray(_ref);
[_ref2, _ref3] = [_globalThis.Array.prototype, 7];
// a marked nav resolves like the plain one
at = _atMaybeArray(_ref2);
zn = _ref3;
[_ref4] = [_globalThis.Array.prototype];
// a kept WRITE as the element: the store is a prefix of its own, and the nav reads what it stored
deep = _findLastMaybeArray(_ref4);
[_ref5] = [kw = _globalThis];
// NEGATIVE: a leaf off the object the hops merely REACH is a name match, not a surface claim
kept = _copyWithinMaybeArray(_ref5.Array.prototype);
[{
  Array: {
    keys: named
  }
}] = [_globalThis];
// ... and the `?.` buys it no route around that rule: the hop short-circuits the whole chain, so the
// question the marked nav answers is the plain one's
let markedName;
[{
  Array: {
    keys: markedName
  }
}] = [_globalThis];
// A computed key runs before its method read; the captured receiver also serves the sibling.
[_ref6] = _ref7 = [Array.prototype], _ref8 = _ref6, null == _ref8 ? _ref8[""] : (_pushMaybeArray(log).call(log, "k"), keyed = _flatMapMaybeArray(_ref8)), {
  other
} = _ref8, _ref8, _ref7;
// ... and a FLAT static under a multi wrapper is claimed like the instance one above it: the
// OVERWRITE channel owns the shape, so the destructure stays whole for the sibling that still binds
// and the ponyfill is written after it. Left to the cascade rebuild - which never descends a
// multi-element wrapper - the slot read its static off the raw element instead
[{
  of: stat
}, zn] = [{
  of: _Array$of
}, 7];
export { flat, at, deep, kept, kw, named, markedName, keyed, other, stat, zn, log };