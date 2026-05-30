import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3;
// deep optional chain whose nested polyfill combines leave a PARTIALLY deoptionalized
// receiver (some `?.` stripped at the folded hop, the chain-root `?.` kept). compose must
// locate the inner needle in that partial-deopt form instead of throwing
const r = null == (_ref = arr == null ? void 0 : _at(arr).call(arr, 0)) ? void 0 : _at(_ref2 = _includes(_ref3 = _flatMaybeArray(_ref).call(_ref)).call(_ref3, 1)).call(_ref2, 2);