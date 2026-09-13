import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
// A later alias retains the possible realm value of a conditionally initialized binding.
// Its constructor guard carries the namespace needed by the following static member read.
function read() {
  try {
    var realm = _globalThis;
  } finally {}
  const held = realm;
  return (held === _globalThis ? _Promise : held.Promise).allSettled([]);
}