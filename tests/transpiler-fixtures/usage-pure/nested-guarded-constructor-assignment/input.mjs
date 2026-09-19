// An opaque assignment replaces the initial realm before the nested assignment.
// Read Map.groupBy from the supplied value without reviving the old realm candidate.
function read(source) {
  let realm = globalThis;
  [realm] = source;
  let method;
  ({ Map: { groupBy: method } } = realm);
  return typeof method;
}
