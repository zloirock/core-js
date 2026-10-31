import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A known instance caller reads its method when the parameter consumes the slot.
// Every later argument finishes before the method read.
import { restoreProperty } from '../../../helpers/restore-property.cjs';
const events = [];
function own() {
  return 'own';
}
restoreProperty(Array.prototype, 'at', {
  configurable: true,
  get() {
    _pushMaybeArray(events).call(events, 'get');
    return own;
  }
});
function read(_ref, value, _unused = void 0) {
  let at = _atMaybeArray(_ref);
  return at;
}
export const result = read([1], _pushMaybeArray(events).call(events, 'argument'));