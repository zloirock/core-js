import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// A closed parameter default retains native reads beside instance claims in source order.
const events = [];
const row = [0, 1, 2];
Object.defineProperty(row, '[@@iterator]', {
  get() {
    _pushMaybeArray(events).call(events, 'tag');
    return 7;
  }
});
function read(_ref = void 0) {
  let _ref2 = false;
  let _ref3 = _ref === void 0 ? (_ref2 = true, row) : _ref;
  let {} = _ref3;
  let iterator = _getIteratorMethod(_ref3);
  let {
    [(_pushMaybeArray(events).call(events, 'key'), '[@@iterator]')]: tag
  } = _ref3;
  let {
    at
  } = _ref2 ? {
    "at": _atMaybeArray(_ref3)
  } : _ref3;
  return [tag, at.call(row, -1), iterator.call(row).next().value];
}
use(read());