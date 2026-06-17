// The object-literal receiver `w` is reassigned to `{}` BEFORE the nested destructure read, so the read
// no longer sees the original `{ a: Array }` snapshot. The receiver walk detects the dominating
// reassignment and bails; no `Array.from` polyfill is injected. The `&&` guard keeps the bail path
// runtime-safe (`from` is undefined once the snapshot is gone).
let w = { a: Array };
w = {};
const { a: { from } } = w;
from && from([1]);
