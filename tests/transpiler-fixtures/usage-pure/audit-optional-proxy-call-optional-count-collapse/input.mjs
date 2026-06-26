// The collapse-vs-rebind of an optional proxy chain rooted in a PURE call turns on the optional-hop COUNT,
// not just the first hop: EXACTLY ONE optional - the one on the call (`(call)?.self.Map.name`) - keeps the
// call in a null-guard and rebinds the tail off `_ref` (inner global rewritten to `_globalThis`). a SECOND
// optional anywhere - on a proxy hop (`(call)?.self?.Set.name`) or on the leaf (`(call)?.self.WeakMap?.name`)
// - makes the whole optional chain vestigially COLLAPSE to the always-defined polyfill, dropping the pure
// call. babel types every member of an optional chain OptionalMemberExpression, so the count keys on the `?.`
// FLAG, not the node type. distinct ctor per line.
const rebindSingleOpt = (() => globalThis)()?.self.Map.name;
const collapseHopOpt = (() => globalThis)()?.self?.Set.name;
const collapseLeafOpt = (() => globalThis)()?.self.WeakMap?.name;
export { rebindSingleOpt, collapseHopOpt, collapseLeafOpt };
