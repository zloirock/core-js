// a `||` fallback param default whose LEFT carries a POLYFILLABLE instance-method side effect prefix
// (`([1].at(0), Array)`): the synth-swap collapses the fallback to the polyfilled literal, but the
// prefix must keep running AND be polyfilled itself - `[1].at(0)` throws on ie:11 unless rewritten.
// the collapse skip stays off the live prefix (only the dead right + resolved-left tail collapse)
function f({ from } = ([1].at(0), Array) || Set) {
  return from([1]);
}
f();
