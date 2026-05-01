import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// Template literal computed property key wrapped in parens. oxc keeps ParenthesizedExpression,
// babel strips. Both `obj[(`from`)]` shapes should resolve to the same key 'from' and emit
// the polyfill via Symbol.X / static method dispatch
const o = Array;
const a = _Array$from([1, 2]);
const b = _Array$of(3, 4);