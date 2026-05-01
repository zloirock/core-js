import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// oxc-parser preserves ParenthesizedExpression as a runtime-no-op wrapper, babel-parser
// strips parens by default. Both pipelines should reach the same Array binding through
// the wrapper layers and emit equivalent polyfill imports for Array.from / Array.of
const a = _Array$from([1, 2]);
const b = _Array$of(3, 4);