// a pattern reading a `||` / `??` whose left is a for-of head over built-ins, the right dead, reads as the
// head spelled alone: the key takes the identity guard over the head in a declaration and in an assignment,
// an effect prefix around the selection stays ahead of it, and a key claimed at the pattern's edge leaves
// the rest of the pattern reading the head
for (const M of [Map, Set]) {
  const { groupBy } = M || Object;
  use(groupBy);
}
let resolved;
for (const P of [Promise, Set]) {
  ({ withResolvers: resolved } = P ?? Object);
  use(resolved);
}
for (const I of [Iterator, Set]) {
  const { from } = (n(), I || Object);
  use(from);
}
for (const A of [Array, Set]) {
  const { fromAsync, [key]: other } = A || Object;
  use(fromAsync, other);
}
