import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// `globalThis?.Array.prototype.at(0)` - optional chain on proxy-global with `.prototype`
// access. Plugin still recognizes Array.prototype through the proxy-global receiver
// and emits the array-specific `at` polyfill.
_atMaybeArray(_ref = _globalThis.Array.prototype).call(_ref, 0);