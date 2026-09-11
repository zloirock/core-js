// Symbol.iterator computed key wrapped in parens. oxc preserves ParenthesizedExpression
// for `[(Symbol.iterator)]`; babel strips. both pipelines resolve via Symbol.X
// detection through paren / TS peel and emit a polyfill
const obj = {
  [(Symbol.iterator)]() {
    return [1, 2, 3].values();
  }
};
const arr = [...obj];
