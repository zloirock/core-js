// A selected alias contributes its own dispatch families without inventing a scalar type.
export function read(flag, write) {
  const arm = flag ? "x" : ["y"];
  let value = ["z"];
  if (write) value = arm;
  return value.includes("x");
}
