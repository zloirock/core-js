// A bound array literal hands its element to a destructure whose constructor hop is anchored on that
// constructor's ponyfill: a static claimed there leaves no read of itself behind, in any host - an export,
// a loop head, an unbraced `var`, a held hole, two claims - and the constructor's own import stays only
// for a key it serves no static for, which reads it off the ponyfill.
const wrap = [globalThis];
const holed = [0, globalThis];
export const [{ Promise: { allSettled } }] = wrap;
for (const [{ Promise: { any } }] = wrap; ;) {
  use(any);
  break;
}
if (flag) var [{ Reflect: { ownKeys } }] = wrap;
const [, { Map: { groupBy } }] = holed;
const [{ Iterator: { from, concat } }] = wrap;
const [{ Reflect: { apply, extra } }] = wrap;
use(ownKeys, groupBy, from, concat, apply, extra);
