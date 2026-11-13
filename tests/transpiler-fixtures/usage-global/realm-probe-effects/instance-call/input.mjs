// Consuming a backed claim still evaluates the effectful realm receiver and its throwing read.
const effects = [];
export function read() {
  return (effects.push("prefix"), globalThis).window.Array.from([3]).at(-1);
}
