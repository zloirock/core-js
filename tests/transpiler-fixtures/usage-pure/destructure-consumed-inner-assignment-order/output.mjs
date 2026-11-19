import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Consuming the inner pattern keeps its setter before the outer binding.
// Its returned receiver is no longer read after both patterns have been consumed.
const events = [];
const target = {
  set read(value) {
    (_pushMaybeArray(events) || 0).call(events, value([2])[0]);
  }
};
let read;
_pushMaybeArray(events).call(events, 'init');
target.read = _Array$from;
read = _Array$from;
export const result = [read([5]), events];