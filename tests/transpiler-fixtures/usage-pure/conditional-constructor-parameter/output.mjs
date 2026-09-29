import _Promise from "@core-js/pure/actual/promise";
// The parameter reads a static from the constructor stored by a conditional pattern.
let P;
if (true) P = _Promise;
function f({
  try: t
} = P) {
  return typeof t;
}
export const result = f();