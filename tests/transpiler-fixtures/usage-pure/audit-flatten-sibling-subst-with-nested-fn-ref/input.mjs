// flatten sibling decl simultaneously substitutes `globalThis -> _globalThis` AND hosts
// a nested function whose body emits `var _ref;` for an optional-chain instance polyfill.
// the inner function body opens AT a source position AFTER the substitution site, so
// substitution and ref-binding splices must be applied in a single descending-order pass
// over the original source - applying substitution first would shift the body anchor
// offset and the `var _ref;` would land mid-token instead of after `{`
const { Array: { from } } = globalThis, val = (function () {
  const x = globalThis;
  return (function inner() { return arr.flat?.().at; })();
})();
console.log(from, val);
