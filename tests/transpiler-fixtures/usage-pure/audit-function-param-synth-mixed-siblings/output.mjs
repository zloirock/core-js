import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// receiver-rewrite must cover every destructured key, not only polyfilled ones. When a
// sibling (e.g. `isArray`) has no pure entry, the synthetic object still emits
// `isArray: Array.isArray` so `f()` still binds a valid value - dropping it would turn
// `isArray` into `undefined`
function f({
  from,
  isArray,
  of
} = {
  from: _Array$from,
  isArray: Array.isArray,
  of: _Array$of
}) {
  return isArray(from([1, 2])) && of(1);
}
f;