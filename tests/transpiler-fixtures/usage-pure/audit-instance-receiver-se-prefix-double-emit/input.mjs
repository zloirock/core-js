// SequenceExpression receiver with observable side-effects in non-tail slots: `fn()` must
// fire exactly once - native `(fn(), arr).at(-1)` evaluates the prefix once, then dispatches
// `.at` on the tail value
let calls = 0;
const fn = () => { calls++; };
const arr = [1, 2, 3];
const result = (fn(), arr).at(-1);
export { calls, result };
