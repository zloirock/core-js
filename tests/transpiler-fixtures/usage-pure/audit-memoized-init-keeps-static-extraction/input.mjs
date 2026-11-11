// Memoizing one receiver preserves later static claims and evaluates the initializer
// before any binding. Native siblings keep their original position between extractions.
// Bare and proxy-global constructors retain the same static coverage.
const eff = () => {};
function arrayCtor() {
  return Array;
}
export const { name, of } = arrayCtor();
export const { of: seqOf, name: seqName, from: seqFrom } = (eff(), Array);
export const { name: n2, length: l2, of: o2 } = (eff(), Array);

// NEGATIVE: an un-memoized bare constructor never lost them
export const { name: bareName, of: bareOf } = Array;
// NEGATIVE: a proxy-global member receiver already registered its constructor
export const { name: navName, of: navOf } = globalThis.Array;
