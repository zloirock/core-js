import _globalThis from "@core-js/pure/actual/global-this";
// A reassigned key function cannot be folded from its earlier return.
export function read() {
  let key = () => "self";
  key = () => "Math";
  return _globalThis[key()].abs(-3);
}