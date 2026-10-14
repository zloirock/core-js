// A static the build excludes is a method the constructor's ponyfill lacks: every spelling reads it off that
// ponyfill, as on an engine without the method - a member read, a realm member, an alias, a destructure, a realm
// level and a mirrored one, an `in` test, a decided guard and a parameter default. The statics the build serves
// beside them still extract.
export const direct = Promise.try(task);
export const viaRealm = globalThis.Promise.withResolvers();
const P = Promise;
export const viaAlias = P.allSettled(list);
const { any } = P;
const { race } = Promise;
const { Map: { groupBy } } = globalThis;
const { Iterator: { concat }, Array: { from } } = globalThis;
export const tested = 'reject' in Promise;
export const guarded = typeof Promise !== 'undefined' && Promise.all;
export function keyed({ allKeyed, resolve } = Promise) {
  return [allKeyed, resolve];
}
export { any, race, groupBy, concat, from };
