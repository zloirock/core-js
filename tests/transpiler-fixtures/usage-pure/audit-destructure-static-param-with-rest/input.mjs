// Parameter destructure `function f({ from, ...rest } = Array)` mixes static dispatch with rest
// semantics on a DECLARED function: the synth default cannot rebuild a rest shape, and the old
// body-extract lift was caller-lossy.
// caller-soundness: this function is EXPORTED - external callers are invisible, the call-site
// scan cannot prove the default always applies, and the params stay VERBATIM.
function build({ from, ...rest } = Array) {
  const xs = from('xy');
  return xs.at(0) + xs.findLast(p => p) + xs.flat().length;
}
export { build };
