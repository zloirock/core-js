// member-chain dispatch with receiver-side SequenceExpression: the leading `fn()`
// runs BEFORE the polyfilled inner `?.values?.()`. polyfill emission threads
// `meta.sideEffects` through `replaceInstanceLike` (and, when the inner-chain
// combined rewrite fires, `replaceInstanceChainCombined`) so the preceding
// SequenceExpression element wraps the conditional as a SequenceExpression
// instead of being silently dropped. ensures `fnRuns` is visible to user code
// after the chain runs - the original bug emitted just the polyfill conditional
// without the leading `fn()`
let fnRuns = 0;
function fn() {
  fnRuns += 1;
  return 'unused';
}
const arr = [1, 2, 3];
const r = (fn(), arr?.values?.())?.map(x => x);
