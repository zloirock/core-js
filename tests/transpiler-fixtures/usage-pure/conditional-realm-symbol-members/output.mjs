import _globalThis from "@core-js/pure/actual/global-this";
import _isIterable from "@core-js/pure/actual/is-iterable";
// A well-known symbol `in` test above a guarded realm alias carries the is-iterable rewrite
// inside the realm branch. The false branch still reads the source receiver and preserves
// an absent-alias throw.
function read(enabled, value) {
  if (enabled) {
    var realm = _globalThis;
  }
  return realm === _globalThis ? _isIterable(value) : realm.Symbol.iterator in value;
}