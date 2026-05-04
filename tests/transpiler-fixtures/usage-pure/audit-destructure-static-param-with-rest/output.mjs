import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// parameter destructure with RestElement: `function f({ from, ...rest } = Array) { ... }`.
// `tryBodyExtractFromParamDestructure` emits `let from = _Array$from;` at function body
// top + AST-mutates the destructure value to `_unused` (preserves rest semantics).
// receiver narrowing through `arr = from('hi')` inside the body finds the polyfill entry
// via the body-extract alias even though scope binding is now ambiguous post-mutation
function build({
  from: _unused,
  ...rest
} = Array) {
  let from = _Array$from;
  const xs = from('xy');
  return _atMaybeArray(xs).call(xs, 0) + _findLastMaybeArray(xs).call(xs, p => p) + _flatMaybeArray(xs).call(xs).length;
}
export { build };