import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
// Nested computed keys run from outer level to inner level before binding.
// Realm and literal captures both serve their statics without duplicating those key effects.
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
    [(_pushMaybeArray(events).call(events, 'literal'), 'w')]: {}
  } = {
    w: Array
  },
  of = (_pushMaybeArray(events).call(events, typeof of), _Array$of);
export const result = [from([7])[0], of(8)[0], events];