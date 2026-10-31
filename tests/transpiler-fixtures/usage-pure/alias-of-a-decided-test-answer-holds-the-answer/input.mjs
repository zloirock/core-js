// an alias of a selection the build decides to its test's own answer holds that answer: the operand the
// selection skips names no guard candidate for a static read off the alias, member or pattern. an alias
// of a test that runs the `&&` right holds that right
const M = typeof Symbol == 'undefined' && Map;
export const viaMember = () => M.groupBy;
const P = typeof Symbol != 'undefined' || Promise;
export const { allSettled } = P;
const R = typeof Symbol != 'undefined' ?? Reflect;
export const viaNullish = () => R.ownKeys;
const A = typeof Symbol != 'undefined' && Array;
export const viaLive = () => A.from;
