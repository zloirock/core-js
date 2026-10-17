import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// An earlier property default runs before a known caller reads its instance method.
// Both reads stay in their parameter-pattern order.
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
function read({
  missing = _pushMaybeArray(events).call(events, 'default'),
  at
}) {
  return at;
}
export const result = read((_ref => {
  return {
    missing: _ref.missing,
    get at() {
      return _atMaybeArray(_ref);
    }
  };
})([2]));