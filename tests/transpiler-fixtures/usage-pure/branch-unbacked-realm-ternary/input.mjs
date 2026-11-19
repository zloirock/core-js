// A selected terminal window can be absent even when the other arm names the realm.
// Keep that value and its throwing read; provide Promise for a selected realm.
export function read(flag) {
  let held;
  return (flag ? (held = globalThis.window) : globalThis).Promise.length;
}
