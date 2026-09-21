// Nested statics in an outer declaration and sibling IIFE are served independently.
const { Array: { from } } = globalThis, outer = (function () { const { Map: { groupBy } } = globalThis; return groupBy; })();
console.log(from, outer);
