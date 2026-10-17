import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// An earlier parameter default runs before a known caller reads its instance method.
// The method read follows that default and precedes the original function body.
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
function read(value = _pushMaybeArray(events).call(events, 'parameter-default'), _ref) {
  let at = _atMaybeArray(_ref);
  return [at, value];
}
export const result = read(undefined, [3]);