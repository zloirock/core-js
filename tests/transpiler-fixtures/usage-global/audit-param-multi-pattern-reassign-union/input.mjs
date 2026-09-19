// a param reassigned via MULTIPLE same-name destructuring writes to different globals. usage-global
// must union BOTH branches: M can be Object or Array at the call, so M.from needs es.array.from
// (Object has no static from). each reassignment Identifier must pair to its OWN `[M] = ...` by
// node identity; a by-name match collapses them onto the first and drops es.array.from.
function f(M, a, b) {
  const O = Object,
    A = Array;
  if (a) [M] = [O];
  if (b) [M] = [A];
  M.from([1]);
}
