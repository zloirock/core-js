// A lexical loop-body declaration shadows its var head; its read cannot widen the head's constructor.
// A body var writes the head binding instead and shares its possible receiver families.
// Distinct methods keep each loop's injection observable.
for (var M of [Map]) {
  let M = pick();
  use(M.groupBy);
}
for (var s of ['abc']) {
  let s = [1];
  use(s.at(-1));
}
for (var t of ['abc']) {
  var t = [1];
  use(t.includes(1));
}
