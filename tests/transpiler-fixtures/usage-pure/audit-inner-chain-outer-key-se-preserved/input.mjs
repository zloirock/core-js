// member-chain dispatch with a receiver-side SequenceExpression: the leading `fn()` runs
// BEFORE the polyfilled inner `?.values?.()`. emission must keep the preceding
// SequenceExpression element wrapping the conditional as a SequenceExpression rather than
// silently dropping it, so `fnRuns` stays visible to user code after the chain runs (the
// original bug emitted just the polyfill conditional without the leading `fn()`)
let fnRuns = 0;
function fn() {
  fnRuns += 1;
  return 'unused';
}
const arr = [1, 2, 3];
const r = (fn(), arr?.values?.())?.map(x => x);
