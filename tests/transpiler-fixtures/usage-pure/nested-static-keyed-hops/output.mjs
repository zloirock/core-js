import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// Effectful outer keys retain the captured static receiver type.
// Both keys execute before their method binding initializes, and the method is
// polyfilled through either a realm hop or a property of an ordinary literal.
const events = [];
var _ref2 = _globalThis,
  {
    [(_pushMaybeArray(events).call(events, 'realm'), 'Array')]: _ref
  } = null == _ref2 ? _ref2[""] : _ref2,
  _ref3 = _ref,
  from = null == _ref3 ? _ref3[""] : (_pushMaybeArray(events).call(events, typeof from), _Array$from);
var _ref5 = {
    w: Array
  },
  {
    [(_pushMaybeArray(events).call(events, 'literal'), 'w')]: _ref4
  } = null == _ref5 ? _ref5[""] : _ref5,
  _ref6 = _ref4,
  of = null == _ref6 ? _ref6[""] : (_pushMaybeArray(events).call(events, typeof of), _Array$of);
export const result = [from([7])[0], of(8)[0], events];