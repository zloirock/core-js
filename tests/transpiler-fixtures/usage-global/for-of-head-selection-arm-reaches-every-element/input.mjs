// a selection arm that is a for-of head over a literal - spelled as the head, a pattern head's slot or a
// name aliasing one - holds every element in turn, so the union reads the static off each of them, as the
// bare head's own read does; the head itself or its slot, over built-ins, leaves the `||` right dead, which
// loads nothing. the loops bring the iteration modules and each element its family
for (const M of [Map, Array]) use((M || Object).groupBy);
for (const P of [Promise, Array]) {
  const { try: viaDestructure } = P || WeakMap;
  use(viaDestructure);
}
for (const I of [Iterator, Array]) {
  const alias = I;
  use((alias || Array).concat);
}
for (const { S } of [{ S: Array }, { S: Set }]) use((S || Int8Array).of);
