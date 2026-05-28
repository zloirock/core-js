import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// outer `const { Promise } = globalThis` registers a globalAlias entry for `Promise`.
// inner `function Promise() {}` shadow has a non-VariableDeclarator binding shape, so
// the alias-hint MUST NOT attach to it - downstream member access (`Promise.resolve(1)`)
// uses the local function shadow, not the polyfill. only outer-scope `Promise.resolve(0)`
// resolves to the polyfilled binding
const Promise = _Promise;
function inner() {
  function Promise() {}
  Promise.resolve(1);
  return Promise;
}
inner();
_Promise$resolve(0);