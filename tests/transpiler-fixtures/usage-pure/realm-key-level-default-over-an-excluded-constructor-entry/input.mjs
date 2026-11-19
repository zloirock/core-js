// A static is decided by its own entry, never by its constructor's: excluding a constructor only stops injecting
// it, so a static read off the realm under its key takes its polyfill whatever default stands on the level, bound
// beside the rest the realm's own read keeps - whatever spells the realm, beside a nested level, a claimed sibling
// or an export, and in an assignment. Without the default the same, as for a constructor a realm always carries.
const { Map: { groupBy, ...grouped } = WeakSet } = globalThis;
const realm = globalThis;
const { Promise: { try: attempt, ...tried } = WeakMap } = realm;
const { Promise: { allSettled, ...settled } = DOMException } = self;
const { Promise: { any, prototype: { then }, ...anyRest } = Reflect } = globalThis;
export const { Promise: { race, ...raced } = Symbol } = globalThis;
const { Promise: { reject, ...rejected } = Iterator, Set: S } = globalThis;
let resolve, resolved;
({ Promise: { resolve, ...resolved } = URL } = globalThis);
const { Promise: { withResolvers, ...pending } } = globalThis;
const { Array: { from, ...arrays } = AggregateError } = globalThis;
use(groupBy, grouped, attempt, tried, allSettled, settled, any, then, anyRest, reject, rejected, S, resolve, resolved);
use(withResolvers, pending, from, arrays);
