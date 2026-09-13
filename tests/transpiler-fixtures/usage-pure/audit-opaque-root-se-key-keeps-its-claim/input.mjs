// A live optional over an opaque root or an excluded realm root keeps its null guard.
// The function-name read still needs its ponyfill, and every key effect runs once.
// A plain key has the same guard obligation as an effect-bearing key.
let c = 0;
function probeHost() {
  return globalThis.window;
}
export const opaqueRootSeKey = probeHost().window[(c++, 'window')]?.window.Array.name;
export const globalRootSeKey = globalThis.window[(c++, 'window')]?.window.Array.name;
export const globalRootPlainKey = globalThis.window.window?.window.Array.name;
export const globalRootSeStatic = globalThis.window[(c++, 'window')]?.window.Array.of(5);
export const globalRootPlainStatic = globalThis.window.window?.window.Array.of(5);
export { c };
