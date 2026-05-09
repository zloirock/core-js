// chain-assignment receiver `(a = arr).at(-1)` carries the assignment as observable
// side-effect (a takes the rhs-most value). instance dispatch captures the assignment
// via memoize `_ref = (a = arr)` so the assign fires exactly once. SequenceExpression
// preceding-effects on top of chain-assignment shape must not double-emit
let a;
const arr = [1, 2, 3];
const result = (a = arr).at(-1);
export { a, result };
