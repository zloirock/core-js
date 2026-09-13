// A live optional arm can store undefined and the following plain read still throws.
// Keep that value and store while providing Map when the selection yields the realm.
export function read(flag) {
  let held;
  return (flag ? (held = globalThis.window?.self) : globalThis).Map;
}
