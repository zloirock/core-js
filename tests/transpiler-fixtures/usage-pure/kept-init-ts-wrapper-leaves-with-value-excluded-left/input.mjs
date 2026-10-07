// A TS wrapper around an init a static claim empties leaves with the value it wraps: a selection whose left
// the build does not serve (`globalThis.Map`, its constructor entry excluded, while `groupBy` keeps its own)
// stays live, its operands spelled bare ahead of the claim - in a declaration, and in a bodyless slot, which
// becomes a block.
const { groupBy } = (globalThis.Map || (log(), Set)) as any;
if (ok) var { groupBy: grouped } = (globalThis.Map ?? make()) satisfies unknown;
export { groupBy, grouped };
