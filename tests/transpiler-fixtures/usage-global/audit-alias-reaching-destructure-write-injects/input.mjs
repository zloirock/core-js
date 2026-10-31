// the reaching-value channel surfaces a DESTRUCTURE write's member (`({ Map: M } = globalThis)`
// reaches `globalThis.Map`) like the identifier-assignment form, so a member read between
// writes injects its module; the conditional form reaches through the union the same way
let M;
({ Map: M } = globalThis);
M.groupBy([1], x => x);
M = { groupBy: () => 'U' };
function t(c) {
  let P;
  if (c) ({ Promise: P } = globalThis);
  return P.try(() => 1);
}
export const r = t(true);
