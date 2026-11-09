import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A static claim retains its stored receiver exactly once before calling the polyfill.
const held = globalThis.window;
let first, second;
(first = second = held).self.Array.of(3);