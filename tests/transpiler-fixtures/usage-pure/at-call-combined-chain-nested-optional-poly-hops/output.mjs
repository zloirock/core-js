import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
var _ref, _ref2, _ref3;
// two nested polyfilled-optional segments: the inner `flat?.()?.flatMap(...)` sub-chain becomes the
// receiver of the outer `?.at(...)`. Babel emits a NESTED ternary (the inner sub-chain as the outer
// test's memoized operand); unplugin's text emit flattens every guard into one OR-chain instead.
// semantically identical short-circuit, cosmetic AST-shape divergence -> output-unplugin.mjs
const arr = [[1]];
null == (_ref = null == (_ref2 = _flatMaybeArray(arr)) || null == (_ref3 = _ref2.call(arr)) ? void 0 : _flatMapMaybeArray(_ref3).call(_ref3, x => x)) ? void 0 : _atMaybeArray(_ref).call(_ref, 0);