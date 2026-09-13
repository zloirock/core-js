// An opaque assignment replaces the proven realm before destructuring its constructor.
// Keep the supplied Promise and allSettled slot, including their absence.
function read(source) {
  let realm = globalThis;
  [realm] = source;
  const { allSettled } = realm.Promise;
  return allSettled;
}
