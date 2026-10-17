import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Instance and symbol getters run when the parameter consumes each slot.
// A symbol lookup after an instance leaf must not advance ahead of that leaf.
import { restoreProperty } from '../../../helpers/restore-property.cjs';
const key = _Symbol$iterator;
const priorAt = _Object$getOwnPropertyDescriptor(Array.prototype, 'at');
const priorIterator = _Object$getOwnPropertyDescriptor(Array.prototype, key);
const events = [];
function ownAt() {
  return 'at';
}
function ownIterator() {
  return 'iterator';
}
restoreProperty(Array.prototype, 'at', {
  configurable: true,
  get() {
    _pushMaybeArray(events).call(events, 'at');
    return ownAt;
  }
});
restoreProperty(Array.prototype, key, {
  configurable: true,
  get() {
    _pushMaybeArray(events).call(events, 'iterator');
    return ownIterator;
  }
});
export let result;
try {
  result = function ({
    at,
    [key]: iterator
  } = (() => {
    var _ref;
    return _ref = [1, 2], {
      at: _atMaybeArray(_ref),
      [_Symbol$iterator]: _getIteratorMethod(_ref)
    };
  })()) {
    return [at, iterator];
  }();
} finally {
  restoreProperty(Array.prototype, 'at', priorAt);
  restoreProperty(Array.prototype, key, priorIterator);
}