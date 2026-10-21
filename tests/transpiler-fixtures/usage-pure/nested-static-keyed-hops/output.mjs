import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
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
    [(_pushMaybeArray(events).call(events, 'literal'), 'w')]: _ref
  } = {
    w: Array
  },
  of = (_pushMaybeArray(events).call(events, typeof of), _Array$of);
export const result = [from([7])[0], of(8)[0], events];