// a `||` / `??` whose left is a for-of head over an inline literal - the head itself, of any declaration
// kind, or a pattern head's slot of an element written in place - read in the loop's body holds one element
// per pass: where every element is a built-in the right never runs, so nothing is read or loaded for it. a
// head that may hold anything else keeps it: an element that may be falsy, a written or shadowed binding, a
// container read by name, a read before the head ran, an element reading the head itself
for (const M of [Map, Array]) use((M || Object).groupBy);
for (const S of [Set, Array]) use((S ?? Object).fromEntries);
for (const [P] of [[Promise], [Array]]) use((P || Object).hasOwn);
for (const { C } of [{ C: Map }, { C: Array }]) use((C || Object).is);
for (var V of [Map, Set]) use((V || Object).freeze);
for (const N of [Map, shim]) use((N || Object).assign);
for (let W of [Set, Array]) {
  if (c) W = null;
  use((W || Object).getOwnPropertyDescriptors);
}
for (const I of [Iterator, Array]) {
  let I = pick();
  use((I || Object).isSealed);
}
for (const F of [Map, Set]) use(F => (F || Object).seal);
const box = { C: Promise };
box.C = null;
for (const { C } of [box]) use((C || Object).getOwnPropertyNames);
for (var Q of [(use((Q || Object).isFrozen), Map), Set]) use(Q);
for (const Y of [Y]) use((Y || Object).isExtensible);
