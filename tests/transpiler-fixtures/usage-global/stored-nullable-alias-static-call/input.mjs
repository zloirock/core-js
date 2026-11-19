// A static claim retains its stored receiver exactly once before calling the polyfill.
const held = globalThis.window;
let first, second;
(first = second = held).self.Array.of(3);
