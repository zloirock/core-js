// body-extract drops the user-supplied custom default expression. with a rest sibling
// synth-swap bails and body-extract takes over: emits `let from = _polyfill;` regardless
// of whatever default the user had attached. distinct keys (`from` / `of`) make it visible
// that each polyfill kind dispatches independently. polyfill-always-wins contract:
// inside the IIFE there is no external caller, so the documented loss is scoped here
const customFromFn = () => [9];
const customOfFn = () => [9];
// (immediately invoked: caller-lossy param emissions stay sound only when every call site is
// visible - a declared function's params now stay verbatim instead)
(function f({ from = customFromFn, ...rest } = Array) {
  return [from([1]), rest];
})();
(function g({ of = customOfFn, ...rest } = Array) {
  return [of(2), rest];
})();
