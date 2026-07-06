// a `[Symbol.iterator]` key in a per-branch mirror candidate DECLINES the mirror (a synth
// literal has no static string slot for a real-symbol key - folding it emitted an invalid
// bare `Symbol.iterator:` property): a DIVERGING ternary keeps the whole destructure native
// (the foreign branch's legitimate values survive), an `&&` guard keeps the inline-default
// shape; only the well-known-symbol key text and the proxy operands are polyfilled
const { [Symbol.iterator]: it, Array: { from: f } } = c ? globalThis : userObj;
it;
f(x);
const { [Symbol.iterator]: it2, Object: { fromEntries: fe = fb } } = c && globalThis;
it2;
fe(y);
