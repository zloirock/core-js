// a selection a container literal holds in a slot hands the pattern level under that slot one arm per run,
// as the same selection spelled as the source does: an arm that is a name holding several values stays as
// written, a static read off it reads the binding pure swapped in, and that constructor takes the entry
// carrying its own statics - in every pattern host. Set reads no own static and keeps the narrow entry; each
// head may hold null, so its selection stays open
for (const M of [Map, Set, null]) {
  const { W: { groupBy } } = { W: M || Object };
  use(groupBy);
}
for (const P of [Promise, Set, null]) {
  let attempt;
  ({ W: { try: attempt } } = { W: P || Object });
  use(attempt);
}
for (const I of [Iterator, Set, null]) {
  (function ({ W: { from } } = { W: I || Array }) {
    use(from);
  })();
}
for (const S of [Symbol, Set, null]) {
  for (const { W: { for: forKey } } of [{ W: S || Object }]) use(forKey);
}
for (const U of [URL, Set, null]) {
  try {
    run();
  } catch ({ E: { W: { canParse } } = { W: U || Object } }) {
    use(canParse);
  }
}
