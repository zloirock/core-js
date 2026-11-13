// Consuming a backed claim still evaluates the effectful realm receiver and its throwing read.
const effects = [];
export function read() {
  let resolve;
  ({ resolve } = (effects.push("prefix"), globalThis).window.Promise);
  return typeof resolve;
}
