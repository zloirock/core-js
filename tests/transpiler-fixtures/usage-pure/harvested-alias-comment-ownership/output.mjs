import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A static read consumes an alias after preserving a write in its sequence prefix.
// The write retains its comment once when the static read becomes a ponyfill.
const realm = _globalThis;
let held;
export const result = (held = realm /* saved alias */, _Array$from)([1]);
export { held };