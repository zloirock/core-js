// a selection a container literal holds in a slot reaches every arm in the union the pattern level under
// that slot reads, and an arm that is a for-of head over a literal every element, as the same selection
// spelled as the source does - in every pattern host; each head may hold null, so its selection stays open.
// the loops bring the iteration modules and each element its family
for (const M of [Map, Array, null]) {
  const { W: { groupBy } } = { W: M || Object };
  use(groupBy);
}
for (const P of [Promise, Array, null]) {
  let attempt;
  ({ W: { try: attempt } } = { W: P || Array });
  use(attempt);
}
for (const I of [Iterator, Array, null]) {
  (function ({ W: { concat } } = { W: I || Array }) {
    use(concat);
  })();
}
for (const S of [Symbol, Array, null]) {
  for (const { W: { keyFor } } of [{ W: S || Array }]) use(keyFor);
}
