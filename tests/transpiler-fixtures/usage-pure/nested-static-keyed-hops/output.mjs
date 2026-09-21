import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
// Effectful outer keys retain the captured static receiver type.
// Both keys execute before their method binding initializes, and the method is
// polyfilled through either a realm hop or a property of an ordinary literal.
const events = [];
var {
  [(_pushMaybeArray(events).call(events, 'realm'), 'Array')]: {
    [(_pushMaybeArray(events).call(events, typeof from), 'from')]: from
  }
} = {
  Array: {
    from: _Array$from
  }
};
var {
  [(_pushMaybeArray(events).call(events, 'literal'), 'w')]: {
    [(_pushMaybeArray(events).call(events, typeof of), 'of')]: of
  }
} = {
  w: {
    of: _Array$of
  }
};
export const result = [from([7])[0], of(8)[0], events];