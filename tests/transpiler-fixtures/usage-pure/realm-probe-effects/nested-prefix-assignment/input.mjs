// Assigning a destructured optional result preserves nested prefix order.
const effects = [];
export function read() {
  let resolve;
  ({ resolve } = (effects.push("a"), (effects.push("b"), globalThis.window))?.Promise);
  return typeof resolve;
}
