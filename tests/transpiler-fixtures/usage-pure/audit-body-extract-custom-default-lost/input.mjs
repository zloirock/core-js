// body-extract drops the user-supplied custom default. with a rest sibling, synth-swap bails
// and body-extract emits `let from = _polyfill;` regardless of the user's default; even a
// caller-passed `{from: customFn}` is overridden (polyfill always wins). these functions are
// EXPORTED so callers are invisible: params stay VERBATIM, body-extract proven by the iife twin.
const customFromFn = () => [9];
const customOfFn = () => [9];
function f({ from = customFromFn, ...rest } = Array) {
  return [from([1]), rest];
}
function g({ of = customOfFn, ...rest } = Array) {
  return [of(2), rest];
}
export { f, g };
