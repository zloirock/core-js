// a bare-global computed key (`[Set]` - no in-scope binding) in a DECLARED function's
// param-default pattern must NOT be emitted raw into a synth literal (`{ [Set]: Array[Set] }`,
// ReferenceError on ie:11); synth bails. the lossy fallback is sound only because this function
// is non-exported and every local call keeps the default; the key still rewrites to `[_Set]`.
function f({ from, [Set]: y, of } = Array) {
  return [from, of, y];
}
f();
