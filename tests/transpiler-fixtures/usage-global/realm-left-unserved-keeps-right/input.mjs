// A `||` / `??` left read off the realm - directly, through an alias, a destructured binding or a call
// returning it - decides the selection only where the build serves its global: an engine lacking it runs
// the right, whose statics keep their modules. A served realm read still decides (no Set module for the
// right it drops), and a bare name an engine lacks throws first - read directly, through an alias or a call
// returning it (no `Object` static's module for any of them).
const list = [1, 2];
export const viaMember = (globalThis.WeakRef || Array).from(list);
const { of } = globalThis.FinalizationRegistry ?? Array;
export { of };
let reads = 0;
const { groupBy } = (reads++, globalThis.Map) || (log(), Set);
export { groupBy };
export const viaBare = (WeakRef || Object).fromEntries([['k', 1]]);
const BareRef = WeakRef;
export const viaBareAlias = (BareRef || Object).entries({ k: 2 });
function getBareRef() { return WeakRef; }
export const viaBareCall = (getBareRef() || Object).hasOwn({ k: 3 }, 'k');
const Ref = globalThis.WeakRef;
export const viaAlias = (Ref || Promise).allSettled(list);
const { FinalizationRegistry: Registry } = globalThis;
const { any } = Registry ?? Promise;
export { any };
function getRef() { return globalThis.WeakRef; }
const { fromAsync } = getRef() || Array;
export { fromAsync };
