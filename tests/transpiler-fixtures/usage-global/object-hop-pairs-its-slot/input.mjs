// a sole-key object hop pairs with the slot it names, exactly as an array wrapper pairs with its
// sole element: the level is consumed and the claim below it reads the value standing there. a
// GETTER pairs too where its body is one pure return - the read yields that value and the consumed
// level drops nothing observable. what keeps a level whole is what dropping the literal would take
// with it: a getter body with an effect, an unnameable key that could BE this one at runtime, an
// accessor-free spread that could override it (usage-global resolves through that one - it injects
// where the slot MIGHT be read, and over-injection is its safe side). the getter rows live HERE
// rather than in the runtime suite: its baseline forbids ES5 accessors, so only bytes can hold them
const other = {};
const { w: { Map: hopCtor } } = { w: globalThis };
const src = { P: Array };
const { P: { from: hopStatic } } = src;
const { w: { WeakMap: hopThroughGetter } } = { get w() { return globalThis; } };
const { w: { WeakSet: keptByGetterEffect } } = { get w() { mark(); return globalThis; } };
function keptBySpread(extra) {
  const { w: { Array: { of: kept } } } = { w: globalThis, ...extra };
  return kept;
}
function keptByKey(key) {
  const ns = { Q: Array, [key]: Map };
  const { Q: { isArray: kept } } = ns;
  return kept;
}
// a value the level SELECTS between arms is the selecting-receiver channel's, not a pair
const { w: { WeakRef: keptByBranch } } = { w: other ? globalThis : globalThis };
// a NUMERIC key names a slot like any other, and a write to it keeps the level whole all the same
const holder = { 0: globalThis };
holder[0] = other;
const { 0: { Promise: keptByWrite } } = holder;
// a REASSIGNED binding in the slot answers through the flat canon - the guarded-alias route and its
// write enumeration, the reachable union - on every host: a branching realm write (`window ||
// globalThis`) and a non-realm value in the chain enumerate the same objects the flat spelling
// enumerates, and a key those objects never dispatch (`at`) fabricates no typeless instance rows
let orRealm = globalThis;
orRealm = window || globalThis;
const { w: { toSorted: noInstanceRowsOverOr } } = { w: orRealm };
const [{ with: noInstanceRowsOverOrWrapped }] = [orRealm];
const { w: { Set: viaOrAliasHop } } = { w: orRealm };
const [{ AggregateError: viaOrAliasWrapped }] = [orRealm];
var later = globalThis;
later = other;
later = self;
const { w: { findLast: instanceRowsOverLater } } = { w: later };
const [{ Iterator: viaLaterWrapped }] = [later];
function assignHops() {
  let m;
  let n;
  ({ w: { indexOf: m } } = { w: orRealm });
  ({ w: { Symbol: n } } = { w: later });
  return [m, n];
}
// a parameter's slot answers through the flat parameter meta (its default, or the IIFE argument
// the call passes): a string in the slot dispatches `at` on strings alone, the way the flat
// parameter reads it - no typeless array row beside it
function paramStringSlot({ w: { at: stringAt } } = { w: 'ab' }) {
  return stringAt;
}
const iifeStringSlot = (({ w: { includes: m } }) => m)({ w: 'ab' });
// a for-of head's WRAPPED element types its slot through the wrapper level: a realm in the slot
// dispatches no instance key, so no typeless row is fabricated beside the head's own answer
function forOfWrappedRealm() {
  const out = [];
  for (const [{ w: { toReversed: headAt } }] of [[{ w: globalThis }]]) out.push(headAt);
  return out;
}
function mark() {}
export default [
  hopCtor,
  hopStatic,
  hopThroughGetter,
  keptByGetterEffect,
  keptByBranch,
  keptBySpread({}),
  keptByKey('Q'),
  keptByWrite,
  noInstanceRowsOverOr,
  noInstanceRowsOverOrWrapped,
  viaOrAliasHop,
  viaOrAliasWrapped,
  instanceRowsOverLater,
  viaLaterWrapped,
  assignHops(),
  paramStringSlot(),
  iifeStringSlot,
  forOfWrappedRealm(),
];
