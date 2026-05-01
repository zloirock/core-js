import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2, _ref3;
// babel: dedicated OptionalMemberExpression / OptionalCallExpression node types.
// oxc/ESTree: ChainExpression wrapping a CallExpression / MemberExpression with optional: true.
// Both forms must be handled symmetrically by all resolver paths
const obj: {
  items?: any[];
} = {};
const a = null == (_ref = obj.items) ? void 0 : _atMaybeArray(_ref).call(_ref, 0);
const b = null == (_ref2 = obj?.items) ? void 0 : _flatMapMaybeArray(_ref2).call(_ref2, x => [x]);
const c = null == (_ref3 = obj.items) ? void 0 : _includesMaybeArray(_ref3).call(_ref3, 7);