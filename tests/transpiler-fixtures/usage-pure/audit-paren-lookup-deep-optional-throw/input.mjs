// deep optional chain inside paren-wrap: `(arr?.b.includes)(1)`. when arr is null,
// both adapters emit canonical shape: ternary returns void 0, `.call` access on void 0
// throws TypeError. memoize via `_ref = arr.b` so non-null path evaluates `arr.b` once.
// throw-message text differs from native (TypeError class matches per
// intentional-polyfill-design); fixture locks the canonical emit shape
declare const arr: { b: number[] } | null;
const r = (arr?.b.includes)(1);
