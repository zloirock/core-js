// A reassigned key function cannot be folded from its earlier return.
export function read() {
  let key = () => "self";
  key = () => "Math";
  return globalThis[key()].abs(-3);
}
