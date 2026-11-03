// A static read consumes an alias after preserving a write in its sequence prefix.
// The write retains its comment once when the static read becomes a ponyfill.
const realm = globalThis;
let held;
export const result = (held = realm /* saved alias */, realm).self.Array.from([1]);
export { held };
