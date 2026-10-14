// Excluding a constructor only stops injecting the constructor itself: a static read off the realm under its key
// loads its own module whatever default stands on the level, and the rest beside it loads the rest of the family -
// whatever spells the realm, beside a nested level, a claimed sibling or an export, in an assignment and without a
// default alike, as for a constructor a realm always carries.
const { Map: { groupBy, ...grouped } = Set } = globalThis;
const realm = globalThis;
const { Promise: { try: attempt, prototype: { then }, ...tried } = WeakSet } = realm;
export const { Iterator: { from, ...iterators } = DOMException } = self;
let isInteger, numbers, W;
({ Number: { isInteger, ...numbers } = Error, WeakMap: W } = globalThis);
const { RegExp: { escape, ...regexps } } = globalThis;
const { Array: { of, ...arrays } = Reflect } = globalThis;
use(groupBy, grouped, attempt, then, tried, isInteger, numbers, W, escape, regexps, of, arrays);
