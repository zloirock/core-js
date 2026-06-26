import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
var _ref;
// The collapse-vs-rebind of an optional proxy chain rooted in a PURE call turns on the optional-hop COUNT,
// not just the first hop: EXACTLY ONE optional - the one on the call (`(call)?.self.Map.name`) - keeps the
// call in a null-guard and rebinds the tail off `_ref` (inner global rewritten to `_globalThis`). a SECOND
// optional anywhere - on a proxy hop (`(call)?.self?.Set.name`) or on the leaf (`(call)?.self.WeakMap?.name`)
// - makes the whole optional chain vestigially COLLAPSE to the always-defined polyfill, dropping the pure
// call. babel types every member of an optional chain OptionalMemberExpression, so the count keys on the `?.`
// FLAG, not the node type. distinct ctor per line.
const rebindSingleOpt = null == (_ref = (() => _globalThis)()) ? void 0 : _nameMaybeFunction(_ref.self.Map);
const collapseHopOpt = _nameMaybeFunction(_Set);
const collapseLeafOpt = _nameMaybeFunction(_WeakMap);
export { rebindSingleOpt, collapseHopOpt, collapseLeafOpt };