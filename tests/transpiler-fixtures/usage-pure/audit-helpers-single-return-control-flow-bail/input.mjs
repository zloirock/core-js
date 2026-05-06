// singleReturnBodyExpression bails on control flow: branches inside the IIFE body cannot
// be statically picked, so the receiver is unresolved and the call site does not dispatch
// a static polyfill on the inline-call result. distinct prototype methods (.includes /
// .findLast / .toReversed) prove per-call no-static-resolution
const a = (() => { if (cond) return Array; return Set; })().prototype.includes;
const b = (() => { try { return Map; } catch { return WeakMap; } })().prototype.findLast;
const c = (() => { for (const x of items) return x; })().prototype.toReversed;
export { a, b, c };
