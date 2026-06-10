// body-extract fallback path triggered by a rest sibling with a default-value on the
// polyfilled prop: `{from = [], ...rest} = Array`. body-extract emits `let from = _polyfill;`
// at function body top, but the original `= []` user default becomes dead code (polyfill is
// always defined). caller-passed `{from: customFrom}` is also lost - this is the trade-off
// documented for the body-extract path
// (immediately invoked: caller-lossy param emissions stay sound only when every call site is
// visible - a declared function's params now stay verbatim instead)
(function run({ from = [], ...rest } = Array) {
  return [from, rest];
})();
