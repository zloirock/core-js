// a `||` / `??` whose left is a for-of head over built-ins, the right dead, is read as the head spelled
// alone by every host - a member, behind an effect prefix, a pattern, an alias, an array element beside
// another, an `in` test: each element's static loads, and nothing loads for the right, though each right
// names modules no left brings in
for (const M of [Map, Set]) use((M || Object).groupBy);
for (const I of [Iterator, Set]) use((n(), I || Int8Array).from);
for (const P of [Promise, Set]) {
  const { withResolvers } = P ?? WeakMap;
  use(withResolvers);
}
for (const R of [Promise, Set]) {
  const held = R || ArrayBuffer;
  use(held.allSettled);
}
for (const A of [Array]) {
  const [{ fromAsync }, count] = [A || DataView, 1];
  use(fromAsync, count);
}
for (const W of [Promise]) use('try' in (W ?? WeakSet));
