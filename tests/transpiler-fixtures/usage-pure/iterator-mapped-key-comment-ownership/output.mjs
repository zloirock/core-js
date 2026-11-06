import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _getIterator from "@core-js/pure/actual/get-iterator";
import _at from "@core-js/pure/actual/instance/at";
import _map from "@core-js/pure/actual/iterator/map";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
// A first-yield instance claim must preserve the order of the next iterator read.
// The retained key owns its comment; the mapped value uses a fresh key without that comment.
const events = [];
const row = [[], 0];
_Object$defineProperty(row, 1, {
  get() {
    _pushMaybeArray(events).call(events, typeof method);
    return 9;
  }
});
const _ref3 = _map(_getIterator(row), (_ref, _ref2) => _ref2 === 0 ? {
  at: _at(_ref)
} : _ref);
const _ref4 = _ref3.next();
const {
  at /* instance key */: method
} = _ref4.done ? void 0 : _ref4.value;
const [tail] = _ref3;
use(method, tail, events);