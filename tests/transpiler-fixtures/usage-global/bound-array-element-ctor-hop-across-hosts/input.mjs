// A bound array literal hands its element to a destructure that reads a constructor hop: every static
// claimed under it loads its module, in any host - an export, a loop head, an unbraced `var`, a held hole,
// two claims - and so does the constructor whose hop it reads through.
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
