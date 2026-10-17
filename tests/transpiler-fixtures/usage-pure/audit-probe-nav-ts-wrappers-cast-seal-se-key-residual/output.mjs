import _globalThis from "@core-js/pure/actual/global-this";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _self from "@core-js/pure/actual/self";
var _ref;
// A cast-sealed receiver keeps its optional guard. Only a non-null receiver evaluates
// the computed key and selects the pure static.
let c3 = 0;
export const castSealSeKeyResidual = (_ref = (null == _globalThis.window ? void 0 : _self).Object, null == _ref ? _ref[""] : (c3++, _Object$freeze));
export { c3 };