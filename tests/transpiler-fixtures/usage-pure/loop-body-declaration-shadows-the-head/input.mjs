// a declaration in a loop's body block redeclaring the name the loop's head declares shadows the head inside
// the body - a let, a class, a function, a pattern, read before it in a closure, under a for-in head - so a
// read there reads the body's value, never an element the head iterates - nor the global a head named after
// one would leave the read to
for (const M of [Map]) {
  let M = pick();
  use(M.groupBy);
}
for (const s of ['abc']) {
  let s = pick();
  use(s.at(-1));
}
for (const P of [Promise]) {
  class P {}
  use(P.try);
}
for (const I of [Iterator]) {
  function I() {}
  use(I.from);
}
for (const S of [Symbol]) {
  const [S] = [pick()];
  use(S.for);
}
for (const t of ['abc']) {
  use(() => t.includes('b'));
  let t = pick();
}
for (const k in source) {
  let k = [1];
  use(k.findLast(Boolean));
}
for (const Promise of [Map]) {
  let Promise = pick();
  use(Promise.allSettled);
}
