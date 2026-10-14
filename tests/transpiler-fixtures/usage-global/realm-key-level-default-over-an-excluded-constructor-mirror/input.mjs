// A static is decided by its own entry, never by its constructor's: excluding a constructor only stops injecting
// it - the data subset still carries it - so a static read off the realm under its key loads its own module
// whatever default stands on the level, whatever spells the realm, in an assignment and beside a claimed sibling;
// a key with no static of its own reads the realm's slot alone (`of`: no `Array.of`). Under a parameter's default
// the level's own default stays live and loads what it reads (`read({})` reads `WeakSet`).
const { Map: { groupBy } = Set } = globalThis;
const { Promise: { try: attempt } = DOMException } = self;
const { Promise: { allSettled, prototype: { then } } = Reflect } = globalThis;
let any;
({ Promise: { any } = Error } = globalThis);
const { Promise: { race } = Number, WeakMap: W } = globalThis;
const { Promise: { withResolvers, of } = Array } = globalThis;
export function read({ Promise: { reject } = WeakSet } = globalThis) {
  return reject;
}
export { groupBy, attempt, allSettled, then, any, race, W, withResolvers, of };
