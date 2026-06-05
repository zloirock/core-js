import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
var _ref, _ref2, _ref3;
// side-effecting root in the nested-optional-poly-hop shape: getArr() must be memoized into a ref
// and evaluated EXACTLY once in both flavors (babel nests the inner sub-chain, unplugin flattens to
// one OR-chain). pins that root memoization stays parser-consistent across the two emission
// strategies. cosmetic shape divergence -> output-unplugin.mjs
function getArr() { return [[1]]; }
null == (_ref2 = _flatMaybeArray(_ref = getArr())?.call(_ref)) || null == (_ref3 = _flatMapMaybeArray(_ref2).call(_ref2, x => x)) ? void 0 : _atMaybeArray(_ref3).call(_ref3, 0);