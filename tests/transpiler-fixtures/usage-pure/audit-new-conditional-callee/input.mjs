// `new (cond ? Map : Set)()` - chained constructor expression as NewExpression callee.
// resolving the constructed type resolves the callee as a runtime expression, which doesn't peel
// ConditionalExpression - both branches are user-controlled known constructors.
const cond = Math.random() < 0.5;
const m = new (cond ? Map : Set)();
m.has(1);
