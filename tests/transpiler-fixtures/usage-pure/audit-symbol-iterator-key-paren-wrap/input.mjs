// Symbol.iterator computed key wrapped in parens. oxc preserves ParenthesizedExpression
// for `[(Symbol.iterator)]`; babel strips. Both pipelines should resolve via Symbol.X
// detection through unwrapParens / peelFallbackWrappers and emit a polyfill
const obj = {
  [(Symbol.iterator)]() {
    return [1, 2, 3].values();
  }
};
const arr = [...obj];
