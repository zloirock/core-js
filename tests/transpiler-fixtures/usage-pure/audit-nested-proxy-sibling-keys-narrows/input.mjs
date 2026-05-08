// `{ window: { Set, Map } } = globalThis` extracts two sibling polyfill keys from one nested chain.
// Walker must keep iterating siblings after the first match so both Set and Map resolve.
const { window: { Set, Map } } = globalThis;
const s = new Set([1, 2, 3]);
const m = new Map();
m.set('a', s);
const v = m.get('a');
const merged = v.union(new Set([4, 5]));
export { merged };
