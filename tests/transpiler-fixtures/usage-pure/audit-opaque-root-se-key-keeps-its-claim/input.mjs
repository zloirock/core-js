// Opaque and excluded roots retain live guards and function-name claims.
// Effectful realm keys keep source navigation; quiet static claims remain supported.
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
