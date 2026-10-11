import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// a declaration in a loop's body block redeclaring the name the loop's head declares shadows the head inside
// the body - a let, a class, a function, a pattern, read before it in a closure, under a for-in head - so a
// read there reads the body's value, never an element the head iterates - nor the global a head named after
// one would leave the read to
for (const M of [_Map]) {
  let M = pick();
  use(M.groupBy);
}
for (const s of ['abc']) {
  let s = pick();
  use(_at(s).call(s, -1));
}
for (const P of [_Promise]) {
  class P {}
  use(P.try);
}
for (const I of [_Iterator]) {
  function I() {}
  use(I.from);
}
for (const S of [_Symbol]) {
  const [S] = [pick()];
  use(S.for);
}
for (const t of ['abc']) {
  use(() => _includes(t).call(t, 'b'));
  let t = pick();
}
for (const k in source) {
  let k = [1];
  use(_findLastMaybeArray(k).call(k, Boolean));
}
for (const Promise of [_Map]) {
  let Promise = pick();
  use(Promise.allSettled);
}