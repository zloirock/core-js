// In usage-global an alias written under a block that rebinds the name its value reads injects for the
// value the write saw. each row names its own static, so one resolved where the read stands would show
// the outer global's module instead: `Object.groupBy`, not `Map.groupBy`; `Iterator.from`, not
// `Array.from`; the typed-array `of` through a container slot, not `Array.of`; `Object.fromEntries`
// destructured, not a `Set` static; and a realm whose `Promise` is `Object` serves no `try` at all. the
// alias written outside any shadow keeps its global's `Math.sign`
let viaClosure;
{
  const Map = Object;
  viaClosure = Map;
}
export const groupedViaClosure = () => viaClosure.groupBy([1, 2], it => it % 2);
export function iteratedInFunction() {
  let held;
  {
    const Array = Iterator;
    held = Array;
  }
  return held.from([1, 2]);
}
let box;
{
  const Array = Int16Array;
  box = { A: Array };
}
export const ofViaContainer = () => box.A.of(1, 2);
let source;
{
  const Set = Object;
  source = Set;
}
export const destructured = () => {
  const { fromEntries } = source;
  return fromEntries([['a', 1]]);
};
let realm;
{
  const globalThis = { Promise: Object };
  realm = globalThis;
}
export const fromRealm = () => realm.Promise.try;
let unshadowed;
{
  unshadowed = Math;
}
export const signUnshadowed = () => unshadowed.sign(-2);
