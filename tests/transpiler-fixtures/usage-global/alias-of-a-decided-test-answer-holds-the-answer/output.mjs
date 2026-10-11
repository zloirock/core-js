import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// an alias of a selection the build decides to its test's own answer holds that answer: a static read off
// the alias, member or pattern, loads nothing for the operand the selection skips. an alias of a test that
// runs the `&&` right holds that right, and the read loads its static
const M = typeof Symbol == 'undefined' && Map;
export const viaMember = () => M.groupBy;
const P = typeof Symbol != 'undefined' || Promise;
export const {
  allSettled
} = P;
const R = typeof Symbol != 'undefined' ?? Reflect;
export const viaNullish = () => R.ownKeys;
const A = typeof Symbol != 'undefined' && Array;
export const viaLive = () => A.from;