import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
const events = [];
const array = [3, [1, 2]];
function read(_ref = _flatMaybeArray((_pushMaybeArray(events).call(events, 'default'), array)).call(array)) {
  let at = _atMaybeArray(_ref);
  return at.call(array, -1);
}
use(read(), events);