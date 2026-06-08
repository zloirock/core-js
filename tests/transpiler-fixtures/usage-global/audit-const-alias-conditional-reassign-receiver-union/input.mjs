// a `const` that aliases a conditionally-reassigned `let`/`var` must contribute the transitive
// reassignment target to the usage-global union: on the c-true path M is Array, so M.from dispatches
// Array.from (unpolyfilled on ie:11). the union recovery follows the const-init hop to M0's reachable
// reassignments, so es.array.from is injected (the direct M0 form already worked)
function f(c) {
  let M0 = Object;
  if (c) {
    M0 = Array;
  }
  const M = M0;
  M.from([1, 2, 3]);
}
f(Math.random() > 0.5);
