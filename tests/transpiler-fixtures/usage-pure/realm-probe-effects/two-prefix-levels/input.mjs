// Prefixes at distinct receiver levels preserve their evaluation order.
const effects = [];
export function read() {
  const held = globalThis.window;
  return typeof ((effects.push("a"), (effects.push("b"), held).self).Promise).resolve;
}
