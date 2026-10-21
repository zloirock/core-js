import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// Sibling initializers surround one guarded key effect.
const log = [];
const before = (_pushMaybeArray(log).call(log, 'before'), 1);
const of = ((null == _globalThis.window ? void 0 : ((_pushMaybeArray(log) || 0).call(log, _atMaybeArray(_ref = [7]).call(_ref, 0)), Array)).of, _Array$of);
const after = (_pushMaybeArray(log).call(log, 'after'), 2);
export const result = [before, of(3), after, log];