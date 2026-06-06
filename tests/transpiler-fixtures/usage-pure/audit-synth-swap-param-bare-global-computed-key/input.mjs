// a bare-global computed key (`[Set]` - no in-scope binding) in a synth-swap-eligible param-default
// pattern must NOT be emitted raw into a synth literal (`{ [Set]: Array[Set] }`), which throws
// ReferenceError on ie:11 where `Set` is absent. both plugins bail the synth and body-extract the
// polyfillable shorthands (`from`, `of`) instead; the bare-global key is rewritten normally to `[_Set]`
function f({ from, [Set]: y, of } = Array) {
  return [from, of, y];
}
f();
