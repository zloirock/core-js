import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// combined-chain `(arr as any)?.at?.(0).toString()` with TS cast wrapping the inner member.
// the combined emission replaces the whole chain via one polyfill call - without walking
// into the inner subtree for skipping, descendant identifiers queued by the pre-traversal
// would still fire their individual visits, allocating a dead `_ref` and bloating output
const arr = [1, 2, 3];
const sum = (null == (_ref = arr as any) ? void 0 : _atMaybeArray(_ref)?.call(_ref, 0))?.toString();
export { sum };