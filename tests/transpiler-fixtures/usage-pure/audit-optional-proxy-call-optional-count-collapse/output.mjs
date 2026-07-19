import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
var _ref;
// The optional-hop COUNT decides whether the null-guard survives - the tail ALWAYS collapses to the pure
// ctor either way. EXACTLY ONE optional (on the call, `(call)?.self.Map.name`) keeps the call in a null-
// guard (`_ref = call`, inner global rewritten to `_globalThis`) while the body collapses to `_Map`. a
// SECOND optional anywhere - on a proxy hop (`(call)?.self?.Set.name`) or the leaf (`(call)?.self.WeakMap
// ?.name`) - makes the whole chain vestigially defined, so the guard drops too and only the pure ctor
// remains. babel types every member of an optional chain OptionalMemberExpression, so the count keys on the
// `?.` FLAG, not the node type. distinct ctor per line.
const rebindSingleOpt = null == (_ref = (() => _globalThis)()) ? void 0 : _nameMaybeFunction(_Map);
const collapseHopOpt = _nameMaybeFunction(_Set);
const collapseLeafOpt = _nameMaybeFunction(_WeakMap);
export { rebindSingleOpt, collapseHopOpt, collapseLeafOpt };