// Consuming a backed claim still evaluates the effectful realm receiver and its throwing read.
const effects = [];
export function read() {
  class Box { constructor(value) { this.value = value;
  } } return typeof new Box((effects.push("prefix"), globalThis).window.Promise.resolve).value;
}
