// an SE-bearing hop key over an OPAQUE root: no proxy-global identifier roots this nav, so nothing
// downstream re-drives a claim standing down here and the peeled-SE route owes the guard itself.
// the route asked instead whether the whole RECEIVER's value can be undefined, which answers for
// its BACKED leaf while the `?.` below still tests the environment - the claim was turned away and
// the chain shipped raw, with no `Function.prototype.name` ponyfill on a floor that lacks it
let c = 0;
function probeHost() {
  return globalThis.window;
}
export const opaqueRootSeKey = probeHost().window[(c++, 'window')]?.window.Array.name;
// NEGATIVE: a proxy-global root files a claim of its own, and the run folds onto it
export const globalRootSeKey = globalThis.window[(c++, 'window')]?.window.Array.name;
export { c };
