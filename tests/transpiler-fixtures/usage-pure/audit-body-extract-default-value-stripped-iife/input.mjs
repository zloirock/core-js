// rest sibling with a default-value on the polyfilled prop `{from = [], ...rest} = Array` triggers
// body-extract: emits `let from = _polyfill;` at body top, so the `= []` user default becomes dead
// code and a caller-passed `{from: customFrom}` is also lost (the body-extract trade-off).
// immediately-invoked twin: the lossy emission is sound because the single call site is visible.
(function run({ from = [], ...rest } = Array) {
  return [from, rest];
})();
