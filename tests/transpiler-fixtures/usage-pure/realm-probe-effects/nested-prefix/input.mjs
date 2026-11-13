// Every nested receiver prefix runs before the optional test, including its absent arm.
const effects = [];
export function read() {
  const { resolve } = (effects.push("a"), (effects.push("b"), globalThis.window))?.Promise;
  return typeof resolve;
}
