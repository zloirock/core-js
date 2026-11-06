import _globalThis from "@core-js/pure/actual/global-this";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _self from "@core-js/pure/actual/self";
var _ref;
// Computed-key destructures retain the optional probe and plain read above a seal.
// A missing receiver throws before the pattern key effect runs.
// The defined-hop case keeps its plain receiver and one key effect.
let c9 = 0;
export const viaProbeSeKeyResidual = (_ref = null == _globalThis.window ? void 0 : _self.Object, null == _ref ? _ref[""] : (c9++, _Object$getOwnPropertyNames));
export { c9 };