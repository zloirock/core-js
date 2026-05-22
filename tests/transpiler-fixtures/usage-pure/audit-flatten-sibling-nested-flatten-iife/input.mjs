// Single declaration with two declarators: outer flattens `{Array:{from}} = globalThis`,
// sibling is an IIFE whose body has its own inner `{Map:{groupBy}} = globalThis`. Each
// destructure flattens independently and the IIFE wrapper is preserved.
const { Array: { from } } = globalThis, outer = (function () { const { Map: { groupBy } } = globalThis; return groupBy; })();
console.log(from, outer);
