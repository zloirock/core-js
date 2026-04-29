// self-ref var with paren-wrapped init AND subsequent mutation - both forms must skip
// the global rewrite. Paren peel handles `var Promise = (Promise);` (some parsers
// preserve the paren as a node, others strip it); the constant-violations scope check
// rejects the post-mutate reads regardless. Post-mutate `Promise.try` stays bound to
// the user's reassignment rather than being rewritten to the polyfill `_Promise.try`
function a() {
  var Promise = (Promise);
  Promise = mock;
  Promise.try(() => 1);
}
function b() {
  var Promise = Promise;
  Promise = mock1;
  Promise = mock2;
  Promise.try(() => 1);
}