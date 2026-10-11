import _Array$from from "@core-js/pure/actual/array/from";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Promise from "@core-js/pure/actual/promise";
// a key alias an unconditional block reassigns from a name the block itself binds holds that block's
// value at a later read - read in the block, not where the alias is declared, past an outer namesake
// too - and the dead initializer names nothing; a block the condition may skip leaves both values live
let K = 'of';
{
  const s = 'from';
  K = s;
}
export const listed = x => _Array$from(x);
let J = 'values';
{
  const t = 'entries';
  J = t;
}
const t = 'fromEntries';
export const pairs = o => _Object$entries(o);
let H = 'any';
if (flag) {
  const u = 'allSettled';
  H = u;
}
export const settled = p => _Promise[H](p);