// Template literal computed property key wrapped in parens. oxc keeps ParenthesizedExpression,
// babel strips. Both `obj[(`from`)]` shapes should resolve to the same key 'from' and emit
// the polyfill via Symbol.X / static method dispatch
const o = Array;
const a = o[(`from`)]([1, 2]);
const b = o[((`of`))](3, 4);
