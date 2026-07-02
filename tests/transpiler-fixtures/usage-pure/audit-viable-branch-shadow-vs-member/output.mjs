import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// conditional fallback inside a function whose param shadows `Array`: only the
// `globalThis.Array` branch resolves to the real global. asymmetry between branches
// must remain stable - the shadowed branch must NOT polyfill
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