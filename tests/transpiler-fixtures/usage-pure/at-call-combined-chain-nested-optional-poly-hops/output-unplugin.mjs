import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4;
// two nested polyfilled-optional segments: the inner `flat?.()?.flatMap(...)` sub-chain becomes the
// receiver of the outer `?.at(...)`. Babel emits a NESTED ternary (the inner sub-chain as the outer
// test's memoized operand); unplugin's text emit flattens every guard into one OR-chain instead.
// semantically identical short-circuit, cosmetic AST-shape divergence -> output-unplugin.mjs
const arr = [[1]];
null == (_ref = _flatMaybeArray(arr)?.call(arr)) || null == (_ref2 = _flatMapMaybeArray(_ref).call(_ref, x => x)) ? void 0 : _atMaybeArray(_ref2).call(_ref2, 0);
// the SE-keyed POLY optional hop joins the same divergence family; the key SE replays
// between the receiver memo and the dispatch identically on both emitters
null == (_ref3 = _flatMaybeArray(arr)?.call(arr)) || null == (_ref4 = (eff2(), _findMaybeArray(_ref3).call(_ref3, h))) ? void 0 : _at(_ref4).call(_ref4, 6);