// non-proxy MemberExpression branch: `someObj.Array` is a user namespace property,
// not a proxy-global chain. resolveObjectName walks the chain - someObj is a local
// const that doesn't resolve to a global proxy, so isViableBranchForKey returns
// null for that branch. with the OTHER branch resolving (bare Array), the resolved
// path uses the resolving branch and fromFallback flags it. distinct keys per
// declaration to keep the dispatch traceable
const someObj = { Array: class MyArray {} };
function f({ from } = cond ? someObj.Array : Array) {
  return from([1]);
}
function g({ of } = cond ? someObj.Array : Array) {
  return of(1, 2);
}
export { f, g };
