// self-ref var with paren-wrapped init AND subsequent mutation - both forms must skip
// the global rewrite. paren-peel `unwrapParens(init)` handles `var Promise = (Promise);`
// (oxc preserves parens; babel strips); constantViolations check rejects the post-mutate
// reads regardless. without either fix the post-mutate `Promise.try` rewrites to
// `_Promise.try`, silently dropping the user's reassignment
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