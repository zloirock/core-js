import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// `new (cond ? Map : Set)()` - chained constructor expression as NewExpression callee.
// resolving the constructed type resolves the callee as a runtime expression, which doesn't peel
// ConditionalExpression - both branches are user-controlled known constructors.
const cond = Math.random() < 0.5;
const m = new (cond ? _Map : _Set)();
m.has(1);