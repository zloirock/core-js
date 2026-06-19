// a `||` fallback whose RIGHT operand is a global proxy (`m || globalThis`): the left is the
// primary value, the proxy is the fallback taken when the left is falsy. the proxy operand is
// mirrored to a synth literal binding the polyfill UNCONDITIONALLY, the non-proxy left stays
// verbatim - so the falsy-left path uses the polyfill, not a missing / buggy native Array.from
const m = 0;
const { Array: { from } } = m || globalThis;
from([1, 2]);
