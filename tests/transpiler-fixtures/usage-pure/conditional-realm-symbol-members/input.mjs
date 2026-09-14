// A well-known symbol `in` test above a guarded realm alias carries the is-iterable rewrite
// inside the realm branch. The false branch still reads the source receiver and preserves
// an absent-alias throw.
function read(enabled, value) {
  if (enabled) { var realm = globalThis; }
  return realm.Symbol.iterator in value;
}
