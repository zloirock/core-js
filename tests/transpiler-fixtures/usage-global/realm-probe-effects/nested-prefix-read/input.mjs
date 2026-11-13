// A read through an optional result preserves both receiver prefixes before its throw.
const effects = [];
export function read() {
  return typeof ((effects.push("a"), (effects.push("b"), globalThis.window))?.Promise).resolve;
}
