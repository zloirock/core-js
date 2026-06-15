import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
var _ref, _ref2, _ref3;
// an optional inner method call reached through a side-effecting COMPUTED KEY, with a trailing
// instance hop. per ECMA the receiver object evaluates before the computed key, so the receiver
// memo must precede the key effect in the combined-chain emit - earlier the key effect ran first
const log = [];
function recv() { _pushMaybeArray(log).call(log, 'recv'); return [[1]]; }
function key() { _pushMaybeArray(log).call(log, 'key'); return 'flat'; }
const r = null == (_ref2 = (_ref = recv(), key(), _flatMaybeArray(_ref))) ? void 0 : _mapMaybeArray(_ref3 = _ref2.call(_ref)).call(_ref3, x => x);
export { r };