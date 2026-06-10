// body-extract drops the user-supplied custom default expression. with a rest sibling
// synth-swap bails and body-extract takes over: emits `let from = _polyfill;` regardless
// of whatever default the user had attached. distinct keys (`from` / `of`) make it visible
// that each polyfill kind dispatches independently. polyfill-always-wins contract:
// caller `f({from: customFn})` is also overridden when body-extract fires
// NOTE: these functions are EXPORTED - external callers are invisible, so the call-site scan
// cannot prove the default always applies and the params stay VERBATIM; the body-extract
// behavior is covered by the immediately-invoked twin fixture
const customFromFn = () => [9];
const customOfFn = () => [9];
function f({ from = customFromFn, ...rest } = Array) {
  return [from([1]), rest];
}
function g({ of = customOfFn, ...rest } = Array) {
  return [of(2), rest];
}
export { f, g };
