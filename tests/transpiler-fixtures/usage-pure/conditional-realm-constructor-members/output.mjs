import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
// A constructor read through a conditionally initialized realm alias keeps an identity guard.
// Members read from that result require the constructor's complete pure namespace.
function read() {
  try {
    var realm = _globalThis;
  } finally {}
  return (realm === _globalThis ? _Promise : realm.Promise).allSettled([]);
}