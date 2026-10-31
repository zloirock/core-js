// an assignment-cascade host whose RHS is a `&&`-guarded proxy. the proxy operand is mirrored to
// a synth literal that binds the polyfill UNCONDITIONALLY (so a present-but-buggy native Array.from
// is still replaced, not just a missing one), while the `&&` guard is kept verbatim: a falsy guard
// short-circuits to the falsy operand and the native destructure throws, exactly as untransformed
let from;
let guard = 0;
({ Array: { from } } = guard && globalThis);
