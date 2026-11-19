import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _getIterator from "@core-js/pure/actual/get-iterator";
var _ref;
// Nested receiver prefixes evaluate before its tail is captured.
// A later computed symbol-key write cannot replace the selected iterator receiver.
let arr;
const log = [];
export const result = (_ref = (_pushMaybeArray(log).call(log, 'first'), _pushMaybeArray(log).call(log, 'second'), arr = ['held'], arr), _pushMaybeArray(log).call(log, 'key'), arr = ['swapped'], _getIterator(_ref)).next().value;