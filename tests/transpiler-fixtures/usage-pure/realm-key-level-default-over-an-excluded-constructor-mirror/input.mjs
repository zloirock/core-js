// A static is decided by its own entry, never by its constructor's: excluding a constructor only stops injecting
// it - the data subset still carries it - so a static read off the realm under its key takes its polyfill and the
// mirror fills the slot with it, the level's dead default leaving, whatever spells the realm, in an assignment and
// beside a claimed sibling; a key with no static of its own reads the realm's slot raw (`of`). Under a parameter's
// default the level's own default stays live, a caller's object standing in for the realm.
const { Map: { groupBy } = WeakSet } = globalThis;
const { Promise: { try: attempt } = WeakMap } = self;
const { Promise: { allSettled, prototype: { then } } = DOMException } = globalThis;
let any;
({ Promise: { any } = Reflect } = globalThis);
const { Promise: { race } = Symbol, Set: S } = globalThis;
const { Promise: { withResolvers, of } = Array } = globalThis;
export function read({ Promise: { reject } = URL } = globalThis) {
  return reject;
}
export { groupBy, attempt, allSettled, then, any, race, S, withResolvers, of };
