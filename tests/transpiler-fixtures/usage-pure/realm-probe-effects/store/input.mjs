// Consuming a backed claim still evaluates the effectful realm receiver and its throwing read.
export function read() {
  let held;
  return typeof (held = globalThis.self).window.Promise.resolve;
}
