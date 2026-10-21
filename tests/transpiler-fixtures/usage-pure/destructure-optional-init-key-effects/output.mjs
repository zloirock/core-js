import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// A consumed optional initializer keeps its key effect inside the reached branch.
// Nested instance calls in that effect retain their own polyfills.
const log = [];
const of = ((null == _globalThis.window ? void 0 : ((_pushMaybeArray(log) || 0).call(log, _atMaybeArray(_ref = [7]).call(_ref, 0)), Array)).of, _Array$of);
export const result = [of(3), log];