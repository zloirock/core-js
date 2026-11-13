// The sequence prefix runs before a nullable alias is read.
const effects = [];
export function read() {
  const held = globalThis.window;
  return typeof ((effects.push("prefix"), held).Promise).resolve;
}
