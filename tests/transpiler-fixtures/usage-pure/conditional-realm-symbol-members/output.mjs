import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol from "@core-js/pure/actual/symbol";
// A well-known symbol read above a guarded realm alias uses the constructor's full namespace.
// The false branch still reads the source receiver and preserves an absent-alias throw.
function read(enabled, value) {
  if (enabled) {
    var realm = _globalThis;
  }
  return (realm === _globalThis ? _Symbol : realm.Symbol).iterator in value;
}