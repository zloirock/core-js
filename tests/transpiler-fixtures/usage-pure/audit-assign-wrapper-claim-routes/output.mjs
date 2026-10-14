import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
// An assignment under an array wrapper reads each claimed element once: the wrapper captures it and
// the method dispatches on the capture, whatever leads the element - a realm navigation, a dead `?.`
// over the realm, a kept write. A leaf off a constructor the hops merely reach is a name match only.
const log = [];
let flat, at, deep, kept, kw, named, keyed, other, stat, zn;
// A sole wrapper assigns its captured method after the native array step.
[_ref] = [_globalThis.Array.prototype];
flat = _flatMaybeArray(_ref);
// A neighbouring element binds after the first captured method read.
[_ref2, _ref3] = [_globalThis.Array.prototype, 7];
at = _atMaybeArray(_ref2);
zn = _ref3;
// a marked nav resolves like the plain one
[_ref4] = [_globalThis.Array.prototype];
deep = _findLastMaybeArray(_ref4);
// a kept WRITE as the element: the store is a prefix of its own, and the nav reads what it stored
[_ref5] = [kw = _globalThis];
kept = _copyWithinMaybeArray(_ref5.Array.prototype);
// NEGATIVE: a leaf off the object the hops merely REACH is a name match, not a surface claim
[{
  Array: {
    keys: named
  }
}] = [_globalThis];
// ... and a dead `?.` over the realm changes nothing about that
let markedName;
[{
  Array: {
    keys: markedName
  }
}] = [_globalThis];
// A computed key runs before its method read; the captured receiver also serves the sibling.
[_ref6] = [Array.prototype], null == _ref6 ? _ref6[""] : (_pushMaybeArray(log).call(log, "k"), keyed = _flatMapMaybeArray(_ref6)), {
  other
} = _ref6;
// a static under a wrapper with a neighbour is served by a literal in its slot: the pattern stays
// whole for the neighbour that still binds
[{
  of: stat
}, zn] = [{
  of: _Array$of
}, 7];
export { flat, at, deep, kept, kw, named, markedName, keyed, other, stat, zn, log };