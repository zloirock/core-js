// an alias holding a `||` / `??` whose left is a for-of head over built-ins, the right dead, holds what the
// head holds: a static read off it, as a member or through a pattern, takes the identity guard over the
// head's elements as a read off an alias of the head spelled alone does
for (const M of [Map, Set]) {
  const held = M || Object;
  use(held.groupBy);
}
for (const P of [Promise, Set]) {
  const held = P ?? Object;
  const { try: attempt } = held;
  use(attempt);
}
