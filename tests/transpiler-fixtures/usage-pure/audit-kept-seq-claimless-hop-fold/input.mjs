// a claim-less read over a NESTED sequence whose tail runs proxy hops: no claim consumes the
// chain, so the hop fold is the only render owed - the plain dotted run drops onto its root in
// place (an alias root keeps its identifier) and the sequence with its `?.` stays as written.
// probes fold WITH the run - the deep-nav canon the flat twins lock - and only the single
// terminal probe reading directly off the root keeps its read, as the environment test.
// the boundary's `?.` survives; standing down instead left a raw `.self` read off the pure root.
const g = globalThis;
let c = 0, d = 0;
export const folded = (d++, (c++, globalThis.self))?.foo;
export const deepRun = (d++, (c++, globalThis.self.self))?.bar;
export const tailRead = (d++, (c++, globalThis.self))?.baz.qux;
export const aliasRoot = (d++, (c++, g.self))?.quux;
export const foldedCall = (d++, (c++, globalThis.self))?.garply();
export const aliasCall = (d++, (c++, g.self))?.waldo();
export const probeUnder = (d++, (c++, globalThis.window.self))?.corge;
export const probeOverBacked = (d++, (c++, globalThis.self.window))?.grault;

// NEGATIVE: the environment probe keeps its read - the `?.` is the test the source asked for
export const probeStays = (d++, (c++, globalThis.window))?.foo;
// NEGATIVE: a VALUE position folds to the leaf ponyfill, not the root
export const valueForm = (d++, (c++, globalThis.self));
// NEGATIVE: the flat spelling proves through the single level and erases its guard
export const flatTwin = (d++, globalThis.self)?.foo;
// NEGATIVE: a SHADOWED realm name holds the user's object - the whole spelling stays as written
export function shadowed(self) {
  return (d++, (c++, self.globalThis))?.foo;
}
