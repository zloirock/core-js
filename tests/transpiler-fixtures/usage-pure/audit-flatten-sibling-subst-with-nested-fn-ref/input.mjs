// flatten sibling decl simultaneously substitutes `globalThis -> _globalThis` AND hosts a
// nested function whose body emits `var _ref;` for an optional-chain instance polyfill. the
// inner body opens AFTER the substitution site, so both splices must apply in a single
// descending-order pass over the original source - substituting first would shift the body
// anchor offset and `var _ref;` would land mid-token instead of after `{`.
const { Array: { from } } = globalThis, val = (function () {
  const x = globalThis;
  return (function inner() { return arr.flat?.().at; })();
})();
console.log(from, val);
