// The optional-hop COUNT decides whether the null-guard survives - the tail ALWAYS collapses to the pure
// ctor either way. EXACTLY ONE optional (on the call, `(call)?.self.Map.name`) keeps the call in a null-
// guard (`_ref = call`, inner global rewritten to `_globalThis`) while the body collapses to `_Map`. a
// SECOND optional anywhere - on a proxy hop (`(call)?.self?.Set.name`) or the leaf (`(call)?.self.WeakMap
// ?.name`) - makes the whole chain vestigially defined, so the guard drops too and only the pure ctor
// remains. babel types every member of an optional chain OptionalMemberExpression, so the count keys on the
// `?.` FLAG, not the node type. distinct ctor per line.
const rebindSingleOpt = (() => globalThis)()?.self.Map.name;
const collapseHopOpt = (() => globalThis)()?.self?.Set.name;
const collapseLeafOpt = (() => globalThis)()?.self.WeakMap?.name;
export { rebindSingleOpt, collapseHopOpt, collapseLeafOpt };
