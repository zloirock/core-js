import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
const events = [];
const array = [4, 7];
const holder = {
  get value() {
    _pushMaybeArray(events).call(events, 'get');
    return array;
  }
};
for (var method = _atMaybeArray((_pushMaybeArray(events).call(events, 'prefix'), holder.value)), i = 0; i < 1; i++) {
  use(method.call(array, -1), events);
}