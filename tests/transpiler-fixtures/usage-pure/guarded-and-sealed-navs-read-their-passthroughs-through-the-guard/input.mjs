// A guarded or sealed nav keeps its probe where a slot reads past it: plain hops above a `?.`, a computed
// optional hop keyed by a literal or a sequence, a computed boundary member after a seal, a symbol slot
// past a guarded realm and a defaulted static under a store of a realm `&&`. A plain probe in parentheses
// guards nothing and folds.
export function f({ of, other } = globalThis.window?.self.Array) { return [of, other]; }
export function g({ from, other } = globalThis.window?.['Array']) { return [from, other]; }
export function h({ trunc, other } = globalThis.window?.[(0, 'Math')]) { return [trunc, other]; }
const { fromAsync } = (globalThis.window).Array;
const { groupBy } = (globalThis.window?.self)['Map'];
const { [Symbol.iterator]: { name: n } } = globalThis.window?.self;
let stored;
const { Promise: { any = fb } } = (stored = flag && globalThis);
export { fromAsync, groupBy, n, any };
