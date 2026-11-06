import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// A static read consumes an alias after preserving a write in its sequence prefix.
// The write retains its comment once when the static read becomes a ponyfill.
const realm = globalThis;
let held;
export const result = (held = realm /* saved alias */, realm).self.Array.from([1]);
export { held };