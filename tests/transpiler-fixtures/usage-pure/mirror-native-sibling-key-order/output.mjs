import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// A native sibling may have a getter. Read it after the effectful constructor key.
const events = [];
const {
  [(_pushMaybeArray(events).call(events, 'key'), 'Array')]: {
    from
  },
  sibling
} = {
  Array: {
    from: _Array$from
  },
  get sibling() {
    return _globalThis.sibling;
  }
};
use(from([7]), sibling, events);