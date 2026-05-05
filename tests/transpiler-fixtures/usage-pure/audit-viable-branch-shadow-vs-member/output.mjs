import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// shadowed identifier branch in fallback: bare `Array` is locally bound (param) so the
// branch is rejected by isViableBranchForKey's hasBinding gate. globalThis.Array branch
// reaches resolveObjectName which folds the proxy-global chain and survives shadow check.
// Asymmetry between the two branches must remain stable - shadowed branch falls through
function f(Array) {
  const {
    from
  } = cond ? Array : {
    from: _Array$from
  };
  return from([1]);
}
function g(Array) {
  const {
    of
  } = cond ? Array : {
    of: _Array$of
  };
  return of(1, 2);
}
export { f, g };