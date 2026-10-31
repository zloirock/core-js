// A default argument reads the outer box before the body var exists. The returned constructor
// carries Map's family; the unrelated Set in the body needs only its constructor.
const box = { value: Map };
export function read(arg = box) {
  var box = { value: Set };
  return arg.value;
}
