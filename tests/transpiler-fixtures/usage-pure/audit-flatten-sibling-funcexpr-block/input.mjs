// multi-decl flatten + sibling FunctionExpression with block body needing var _ref insert.
// asserts whether the var-decl insert collision affects FunctionExpression too (or only
// arrow with explicit block body)
const { Array: { from } } = globalThis, kls = (function () {
  return [].values();
})();
export { from, kls };
