import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
var _ref, _ref2, _ref3, _ref4;
// side-effecting root in the nested-optional-poly-hop shape: getArr() must be memoized into a ref
// and evaluated EXACTLY once in both flavors (babel nests the inner sub-chain, unplugin flattens to
// one OR-chain). pins that root memoization stays parser-consistent across the two emission
// strategies. cosmetic shape divergence -> output-unplugin.mjs
function getArr() {
  return [[1]];
}
null == (_ref = null == (_ref3 = _flatMaybeArray(_ref2 = getArr())) || null == (_ref4 = _ref3.call(_ref2)) ? void 0 : _flatMapMaybeArray(_ref4).call(_ref4, x => x)) ? void 0 : _atMaybeArray(_ref).call(_ref, 0);