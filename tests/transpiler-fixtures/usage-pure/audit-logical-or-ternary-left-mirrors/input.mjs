// a `||` whose LEFT operand is itself a diverging ternary carrying a global proxy. the left is
// kept (it holds the reachable proxy), its proxy branch mirrored to a synth literal binding the
// polyfill, its user-object branch and the `||` fallback both verbatim - the proxy path uses the
// polyfill, the user paths stay native. guards the recursion: a logical/ternary left is not a
// bare-identifier primary, so it is not skipped for the right fallback
const userObj = { Array: { from: () => "U" } };
const fallback = { Array: { from: () => "F" } };
let pick = true;
const { Array: { from } } = (pick ? globalThis : userObj) || fallback;
from([1]);
