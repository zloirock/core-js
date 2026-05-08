import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Parameter destructure `function f({ from, ...rest } = Array)` mixes static dispatch with rest semantics.
// `from` must be lifted to a body-local polyfill alias while preserving the rest behaviour at runtime.
function build({
  from: _unused,
  ...rest
} = Array) {
  let from = _Array$from;
  const xs = from('xy');
  return _atMaybeArray(xs).call(xs, 0) + _findLastMaybeArray(xs).call(xs, p => p) + _flatMaybeArray(xs).call(xs).length;
}
export { build };