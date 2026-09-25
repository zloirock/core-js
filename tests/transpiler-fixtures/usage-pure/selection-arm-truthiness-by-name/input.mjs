// An arm of a selection keeps the OTHER arm live unless it is provably truthy: a KNOWN global
// constructor, the realm, a static container. An alias holding an unbacked key off the realm resolves
// to a name of its own and is undefined wherever the host lacks it, so the right operand still runs
// and still owes its mirror - calling such a name truthy collapsed the selection onto its left and
// took the right arm's polyfill with it. The realm alias is the positive control: there the right IS dead.
const unbacked = globalThis.shim;
const { Array: { from: viaUnbacked } } = unbacked || globalThis;
const probe = globalThis.window;
const { Set: { customQ: viaProbe } } = probe || globalThis;
const realm = globalThis;
const { Promise: { race: viaRealm } } = realm || globalThis;
// A static container is truthy too - a name bound to a literal, or to a call the call canon proves
// to yield one - so the right arm beside it is dead text on both legs, not a mirror of the realm.
const held = { Array: { from: () => [] } };
const { Array: { from: viaHeld } } = held || globalThis;
const build = () => ({ Array: { from: () => [] } });
const built = build();
const { Array: { from: viaBuilt } } = built || globalThis;
const { Array: { from: viaCall } } = build() || globalThis;
export { viaUnbacked, viaProbe, viaRealm, viaHeld, viaBuilt, viaCall };
