import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A local constructor-shaped value retains its own optional method and receiver.
function read(Array) {
  let held;
  return (held = Array).from?.([1, 2]).at(-1);
}
export const result = read({});