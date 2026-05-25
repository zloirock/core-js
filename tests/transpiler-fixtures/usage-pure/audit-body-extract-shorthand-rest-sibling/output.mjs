import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// body-extract for the bare shorthand `{from}` with a rest sibling. prop binding-identifier resolver
// returns the shorthand identifier directly. emits `let from = _polyfill;` at body top and
// rewrites the prop value to `_unused` so the destructure still consumes the key (rest
// exclusion preserved). complementary leaf to the aliased / default-value variants of
// body-extract. distinct keys (`from` / `of`) on separate functions verify per-key dispatch
function run({
  from: _unused,
  ...rest
} = Array) {
  let from = _Array$from;
  return [from([1]), rest];
}
function emit({
  of: _unused2,
  ...rest
} = Array) {
  let of = _Array$of;
  return [of(2, 3), rest];
}
export { run, emit };