import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
let maybeForwards;
if (_globalThis.setTimeout) maybeForwards = () => ({
  window: {
    Array
  }
});
export const conditionalForwarder = (_ref = maybeForwards?.()?.window?.Array, null == _ref ? void 0 : _ref === Array ? _Array$of(15) : _ref.of(15));