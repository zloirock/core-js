// A trailing spread can replace the Array slot of a nested object-literal container.
// Read each receiver once and select the polyfill only when the slot still holds Array.
// A spread-supplied replacement keeps its own from property.
declare const o: Record<string, any>;
const { root: { Array: { from } } } = { root: { Array, ...o } };
from([1]);
