import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$values from "@core-js/pure/actual/object/values";
var _ref;
let keyCount = 0;
export const computedKeyRoot = null == (() => _globalThis)()?.window ? void 0 : _includesMaybeArray(_ref = (keyCount++, _Object$values)({
  b: 2
})).call(_ref, 2);