// oxc-parser preserves ParenthesizedExpression as a runtime-no-op wrapper, babel-parser
// strips parens by default. Both pipelines should reach the same Array binding through
// the wrapper layers and emit equivalent polyfill imports for Array.from / Array.of
const a = (((Array))).from([1, 2]);
const b = ((((((Array)))))).of(3, 4);
