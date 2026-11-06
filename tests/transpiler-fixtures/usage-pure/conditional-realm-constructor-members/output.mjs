import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
// A constructor read through a conditionally initialized realm alias keeps an identity guard.
// Members read from that result require the constructor's complete pure namespace.
function read() {
  try {
    var realm = _globalThis;
  } finally {}
  return _Promise$allSettled([]);
}