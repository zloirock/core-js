// A later alias retains the possible realm value of a conditionally initialized binding.
// Its constructor guard carries the namespace needed by the following static member read.
function read(present) {
  if (present) {
    var realm = globalThis;
  }
  const held = realm;
  return held.Promise.allSettled([]);
}
