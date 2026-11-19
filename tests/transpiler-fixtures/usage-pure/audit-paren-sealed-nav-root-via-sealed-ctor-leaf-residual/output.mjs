import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref;
// Computed-key destructures retain the optional probe and plain read above a seal.
// A missing receiver throws before the pattern key effect runs.
// The defined-hop case keeps its plain receiver and one key effect.
let c9 = 0;
export const viaSealedCtorLeafResidual = (_ref = (null == _globalThis.window ? void 0 : _self).Array, null == _ref ? _ref[""] : (c9++, _Array$from));
export { c9 };