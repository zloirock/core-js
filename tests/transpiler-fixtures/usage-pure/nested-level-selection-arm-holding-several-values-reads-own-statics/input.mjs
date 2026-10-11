// a selection standing on any level a container literal pairs - an array element, a level deeper down, a
// slot of a container arm, in any spelling the arms split from - hands the pattern under it one arm per run:
// an arm that is a name holding several values stays as written, a static read off it reads the binding
// pure swapped in, and that constructor takes the entry carrying its own statics. a head that may hold null
// keeps a `||` / `??` over it open
for (const M of [Map, Set]) {
  const [{ groupBy }] = [c ? M : Object];
  use(groupBy);
}
for (const P of [Promise, Set, null]) {
  const { A: { W: { try: attempt } } } = { A: { W: P ?? Object } };
  use(attempt);
}
for (const I of [Iterator, Set, null]) {
  const { W: { from } } = c ? { W: I || Array } : box;
  use(from);
}
for (const S of [Symbol, Set]) {
  let cached;
  const { W: [{ for: forKey }] } = { W: [(cached ||= S)] };
  use(forKey);
}
