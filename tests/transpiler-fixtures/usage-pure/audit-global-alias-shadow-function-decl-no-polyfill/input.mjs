// outer `const { Promise } = globalThis` registers a globalAlias entry for `Promise`.
// inner `function Promise() {}` shadow has a non-VariableDeclarator binding shape, so
// the alias-hint MUST NOT attach to it - downstream member access (`Promise.resolve(1)`)
// uses the local function shadow, not the polyfill. only outer-scope `Promise.resolve(0)`
// resolves to the polyfilled binding
const { Promise } = globalThis;
function inner() {
  function Promise() {}
  Promise.resolve(1);
  return Promise;
}
inner();
Promise.resolve(0);
