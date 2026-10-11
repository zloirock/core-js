// the fallback a for-of head over built-ins leaves dead is dead for every host reading it - a declaration's
// or an assignment's pattern, a parameter default, a container a pattern reads its slot off, an alias holding
// the selection - so none of them loads anything for the right; a sole element loads its static. the loops
// bring the iteration modules and each element its family
for (const M of [Map]) {
  const { groupBy } = M || Object;
  use(groupBy);
}
let pick;
for (const S of [Set, Array]) {
  ({ fromEntries: pick } = S || Object);
  use(pick);
}
for (const P of [Promise, Array]) {
  const read = ({ hasOwn } = P || Object) => hasOwn;
  use(read());
}
for (const I of [Iterator, Array]) {
  const { W: { is } } = { W: I || Object };
  use(is);
}
for (const A of [Map, Set]) {
  const held = A || Object;
  use(held.assign);
}
