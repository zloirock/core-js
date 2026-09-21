import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3;
// an assignment host under an array WRAPPER claims what the statement host claims: the element the
// pattern is paired with IS the receiver, so a FLAT claim has one even with no hop chain to resolve,
// and a `?.` the source wrote is a nav all the same - the hop short-circuits the whole chain, so the
// residual and the dispatch read one value
const log = [];
let flat, at, deep, kept, kw, named, keyed, other, stat, zn;
// the SOLE wrapper: the consumed slot leaves and the dispatch takes the statement
// ... a MULTI one keeps the destructure - its neighbour still binds - and appends the dispatch
flat = _flatMaybeArray(_globalThis.Array.prototype);
[{
  at
}, zn] = [_globalThis.Array.prototype, 7];
// a marked nav resolves like the plain one
at = _atMaybeArray(_globalThis.Array.prototype);
// a kept WRITE as the element: the store is a prefix of its own, and the nav reads what it stored
deep = _findLastMaybeArray(_globalThis.Array.prototype);
[kw = _globalThis];
// NEGATIVE: a leaf off the object the hops merely REACH is a name match, not a surface claim
kept = _copyWithinMaybeArray(_globalThis.Array.prototype);
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
[_ref] = _ref2 = [Array.prototype], _ref3 = _ref, null == _ref3 ? _ref3[""] : (_pushMaybeArray(log).call(log, "k"), keyed = _flatMapMaybeArray(_ref3)), {
  other
} = _ref3, _ref3, _ref2;
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