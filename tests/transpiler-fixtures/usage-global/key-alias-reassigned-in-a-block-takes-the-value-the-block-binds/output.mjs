import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a key alias an unconditional block reassigns from a name the block itself binds holds that block's
// value at a later read - read in the block, not where the alias is declared, past an outer namesake
// too - and the dead initializer names nothing; a block the condition may skip leaves both values live
let K = 'of';
{
  const s = 'from';
  K = s;
}
export const listed = x => Array[K](x);
let J = 'values';
{
  const t = 'entries';
  J = t;
}
const t = 'fromEntries';
export const pairs = o => Object[J](o);
let H = 'any';
if (flag) {
  const u = 'allSettled';
  H = u;
}
export const settled = p => Promise[H](p);