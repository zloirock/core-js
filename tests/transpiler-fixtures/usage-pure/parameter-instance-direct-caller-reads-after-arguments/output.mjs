import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A direct caller keeps an instance read after all argument evaluations.
// The string literal receiver is captured before its method getter runs.
import { restoreProperty } from '../../../helpers/restore-property.cjs';
const prior = _Object$getOwnPropertyDescriptor(String.prototype, 'at');
const events = [];
function own() {
  return 'at';
}
restoreProperty(String.prototype, 'at', {
  configurable: true,
  get() {
    _pushMaybeArray(events).call(events, 'at');
    return own;
  }
});
export let result;
try {
  result = ((_ref, other, _unused = void 0) => {
    let at = _atMaybeString(_ref);
    return [typeof at, other];
  })('az', _pushMaybeArray(events).call(events, 'argument'));
} finally {
  restoreProperty(String.prototype, 'at', prior);
}