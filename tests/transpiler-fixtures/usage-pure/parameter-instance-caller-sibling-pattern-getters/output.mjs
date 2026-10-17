import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
// Independent patterns of one caller argument retain their method getter order.
// Both instance reads happen when the parameter consumes its own array position.
// A foreign prototype handout leaves the iterator and its yielded receiver families open.
import { restoreProperty } from '../../../helpers/restore-property.cjs';
const priorAt = _Object$getOwnPropertyDescriptor(Array.prototype, 'at');
const priorFlat = _Object$getOwnPropertyDescriptor(Array.prototype, 'flat');
const events = [];
function ownAt() {
  return 'at';
}
function ownFlat() {
  return 'flat';
}
restoreProperty(Array.prototype, 'at', {
  configurable: true,
  get() {
    _pushMaybeArray(events).call(events, 'at');
    return ownAt;
  }
});
restoreProperty(Array.prototype, 'flat', {
  configurable: true,
  get() {
    _pushMaybeArray(events).call(events, 'flat');
    return ownFlat;
  }
});
export let result;
try {
  result = (([{
    at
  }, {
    flat
  }]) => [at, flat])([{
    at: _atMaybeArray([1])
  }, {
    flat: _flatMaybeArray([[2]])
  }]);
} finally {
  restoreProperty(Array.prototype, 'at', priorAt);
  restoreProperty(Array.prototype, 'flat', priorFlat);
}