// combined-chain `(arr as any)?.at?.(0).toString()` with TS cast wrapping the inner member.
// the combined emission replaces the whole chain via one polyfill call - without walking
// into the inner subtree for skipping, descendant identifiers queued by the pre-traversal
// would still fire their individual visits, allocating a dead `_ref` and bloating output
const arr = [1, 2, 3];
const sum = (arr as any)?.at?.(0)?.toString();
export { sum };
