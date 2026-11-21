// A default argument reads the outer box before the body var exists. The returned constructor
// carries Map's family. The separate body initializer can also request Set statics in global mode.
const box = { value: Map };
export function read(arg = box) {
  var box = { value: Set };
  return arg.value;
}
