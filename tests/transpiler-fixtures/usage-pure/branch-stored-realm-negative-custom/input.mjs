// A stored realm in one arm does not turn the other arm into a realm.
// Provide Map for the realm while retaining the custom constructor and the store.
export function read(Custom, flag) {
  const custom = { Map: Custom };
  let held;
  return (flag ? (held = globalThis) : custom).Map;
}
