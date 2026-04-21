import _Array$from from "@core-js/pure/actual/array/from";
const from = _Array$from;
// multi-declarator form `const { Array: { from } } = globalThis, x = 1`. babel flattens
// via `declarations.splice(idx, 1)` (in-place, avoids crashing still-queued inner
// identifiers on a removed path) so `const from = _Array$from` is hoisted above and
// sibling declarator `x = 1` stays in the original declaration as its only remaining entry
const x = 1;
from([1]);
console.log(x);