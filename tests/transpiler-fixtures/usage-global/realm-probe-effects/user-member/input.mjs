// Consuming a backed claim still evaluates the effectful realm receiver and its throwing read.
const effects = [];
export function read() {
  return typeof ((effects.push("prefix"), globalThis).window.Promise.resolve).name;
}
