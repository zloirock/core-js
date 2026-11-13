// A user consumer does not own the throwing read of its effectful realm argument.
import name from "@core-js/pure/actual/function/instance/name";
const effects = [];
export function read() {
  return typeof name((effects.push("prefix"), globalThis).window.Promise);
}
