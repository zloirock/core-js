// `(typeof x === "string") === false` is the boolean-compare flip of a typeof guard: the early
// return on the flipped branch leaves x narrowed to string in the body, so .at resolves to the
// string-specific helper (parity with the plain `typeof x !== "string"` guard)
function f(x: string | number[]) {
  if ((typeof x === "string") === false) return null;
  return x.at(0);
}
