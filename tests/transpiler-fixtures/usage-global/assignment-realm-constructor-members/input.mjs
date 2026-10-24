// An opaque array assignment replaces the initial realm before the constructor read.
// The supplied value keeps its own Map and groupBy; the dead initializer adds no guard.
function read(source) {
  let realm = globalThis;
  [realm] = source;
  return realm.Map.groupBy([1, 2, 3], value => value % 2);
}
