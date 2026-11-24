import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
// The initialized realm supplies its static directly.
function read() {
  try {
    var realm = _globalThis;
  } finally {}
  const held = realm;
  return _Promise$allSettled([]);
}