// 2-level nested destructure `const { a: { b: { from } } } = wrapper` walks two outer
// keys (`['a', 'b']`) through the const-bound ObjectExpression chain. Receiver chain:
// wrapper -> { a: { b: Array } } -> step 'a' -> { b: Array } -> step 'b' -> Identifier
// 'Array'. Walker recurses into nested ObjectExpression at each step. Distinct methods
// (at, includes, copyWithin) lock array narrowing per call site
const wrapper = { a: { b: Array } };
const { a: { b: { from } } } = wrapper;
const arr = from('xy');
arr.at(0);
arr.includes('x');
arr.copyWithin(0, 1);
