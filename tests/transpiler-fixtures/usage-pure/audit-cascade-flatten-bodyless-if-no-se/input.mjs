// `if (cond) ({Array:{from}} = globalThis);` - bodyless control with cascade-flatten
// destructure. babel's `path.insertAfter` on a bodyless body slot wraps the slot in a
// BlockStatement but leaves the original path's `listKey === undefined` and key pointing
// at the slot name. subsequent `exprStmt.remove()` then targets the slot, removing the
// whole block (including the freshly inserted polyfill assignment). force-wrap up-front
// and re-resolve the path inside the body[] keeps the polyfill assignment intact.
let from;
if (cond) ({ Array: { from } } = globalThis);
console.log(from);
