import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// bare shorthand `{from}` with a rest sibling bails to body-extract: emit `let from = _polyfill`
// at body top, rewrite the prop value so the destructure still consumes the key with rest
// exclusion preserved. distinct keys (`from` / `of`) on separate functions verify per-key dispatch.
// immediately invoked, so caller-lossy param emit is sound (every call site visible)
(function run({
  from: _unused,
  ...rest
} = Array) {
  let from = _Array$from;
  return [from([1]), rest];
})();
(function emit({
  of: _unused2,
  ...rest
} = Array) {
  let of = _Array$of;
  return [of(2, 3), rest];
})();