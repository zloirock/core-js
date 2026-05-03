// Top-level `await` triggers asynchronous module evaluation. The plugin must still
// emit imports at program top + reorder `_ref` after them. Verify polyfilled
// destructure inside async-IIFE-equivalent setting works.
const data = await fetchData();
const arr = [data];
const last = arr.at(-1);
const found = arr.findLast(x => x);
export { last, found };
