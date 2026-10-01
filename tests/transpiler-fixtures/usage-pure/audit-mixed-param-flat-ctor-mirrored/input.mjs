// A claim-free nested read does not prevent the default from mirroring the constructor.
// Math.floor stays native and Set binds the ponyfill.
function read({ Math: { floor }, Set } = globalThis) {
  return [floor(1.9), new Set()];
}
export const out = read();
