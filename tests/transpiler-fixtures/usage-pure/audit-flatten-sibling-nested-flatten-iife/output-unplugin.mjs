import _Array$from from "@core-js/pure/actual/array/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Single declaration with two declarators: outer flattens `{Array:{from}} = globalThis`,
// sibling is an IIFE whose body has its own inner `{Map:{groupBy}} = globalThis`. Each
// destructure flattens independently and the IIFE wrapper is preserved.
const from = _Array$from;
const outer = (function () { const groupBy = _Map$groupBy; return groupBy; })();
console.log(from, outer);