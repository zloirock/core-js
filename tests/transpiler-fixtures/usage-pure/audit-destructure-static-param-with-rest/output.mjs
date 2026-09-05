import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// Parameter destructure `function f({ from, ...rest } = Array)` mixes static dispatch with rest
// semantics on a DECLARED function: the synth default cannot rebuild a rest shape, and the old
// body-extract lift was caller-lossy.
// caller-soundness: this function is EXPORTED - external callers are invisible, the call-site
// scan cannot prove the default always applies, and the params stay VERBATIM.
function build({
  from,
  ...rest
} = Array) {
  const xs = from('xy');
  return _at(xs).call(xs, 0) + _findLastMaybeArray(xs).call(xs, p => p) + _flatMaybeArray(xs).call(xs).length;
}
export { build };