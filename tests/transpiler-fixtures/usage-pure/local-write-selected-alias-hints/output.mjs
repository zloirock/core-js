import _includes from "@core-js/pure/actual/instance/includes";
// A selected alias contributes its own dispatch families without inventing a scalar type.
export function read(flag, write) {
  const arm = flag ? "x" : ["y"];
  let value = ["z"];
  if (write) value = arm;
  return _includes(value).call(value, "x");
}