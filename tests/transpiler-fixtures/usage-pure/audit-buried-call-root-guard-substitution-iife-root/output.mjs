import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// An inline-call chain root BURIES the proxy-global (an IIFE body, an identity argument), and the only hop is one core-js does not
// ponyfill, so nothing collapses and the guard test keeps the root text.
export const iifeRoot = null == (() => _globalThis)()?.window ? void 0 : _atMaybeArray(_ref = _Array$of(5)).call(_ref, 0);