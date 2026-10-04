import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref;
// A sealed optional lookup with an aliased symbol key precedes an argument call.
// Its receiver prefix and getter run before the key effect, once each.
const key = _Symbol$iterator;
const log = [];
const box = {
  get list() {
    _pushMaybeArray(log).call(log, 'receiver');
    return ['held'];
  }
};
export const result = (null == (_ref = (_pushMaybeArray(log).call(log, 'prefix'), box.list)) ? void 0 : (_pushMaybeArray(log).call(log, 'key'), _getIteratorMethod(_ref))).call(_ref, 0).next().value;