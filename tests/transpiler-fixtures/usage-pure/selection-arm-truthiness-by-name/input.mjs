// An arm of a selection keeps the OTHER arm live unless it is provably truthy, and only a KNOWN
// global constructor is that. An alias holding an unbacked key off the realm resolves to a name of
// its own and is undefined wherever the host lacks it, so the right operand still runs and still
// owes its mirror - calling such a name truthy collapsed the selection onto its left and took the
// right arm's polyfill with it. The realm alias is the positive control: there the right IS dead.
const unbacked = globalThis.shim;
const { Array: { from: viaUnbacked } } = unbacked || globalThis;
const probe = globalThis.window;
const { Set: { customQ: viaProbe } } = probe || globalThis;
const realm = globalThis;
const { Promise: { race: viaRealm } } = realm || globalThis;
export { viaUnbacked, viaProbe, viaRealm };
