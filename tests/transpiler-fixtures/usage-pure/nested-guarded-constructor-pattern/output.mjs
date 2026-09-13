import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
// A nested constructor slot from a conditional realm alias keeps the outer identity guard.
// Its child pattern reads static properties from that constructor's complete pure namespace.
function read(enabled) {
  if (enabled) {
    var realm = _globalThis;
  }
  const {
    allSettled
  } = realm === _globalThis ? _Promise : realm.Promise;
  return typeof allSettled;
}