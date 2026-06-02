import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
var _ref, _ref2, _ref3;
// combined chain with an optional OUTER member (`?.at`) and a non-optional hop (`.map(...)`)
// between the inner `flat?.()` and the outer call: the hop must be threaded into the null-checked
// receiver, not discarded - dropping `.map` corrupts the value and loses its polyfill import
const arr = [[1]];
null == (_ref = _flatMaybeArray(arr)) || null == (_ref2 = _mapMaybeArray(_ref3 = _ref.call(arr)).call(_ref3, x => x * 2)) ? void 0 : _atMaybeArray(_ref2).call(_ref2, 0);