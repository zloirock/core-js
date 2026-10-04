import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A complete caller census supplies the same pristine realm through a literal spine.
const events = [];
function read(_ref) {
  let {
      w: [_ref2]
    } = _ref,
    {} = _ref2,
    {
      Array: _ref3
    } = {
      "Array": _ref2.Array
    },
    {} = _ref3,
    {
      of
    } = {
      of: _Array$of
    },
    {
      [(_pushMaybeArray(events).call(events, 'key'), 'from')]: from
    } = {
      from: _Array$from
    },
    {
      length
    } = _ref3;
  return [of(4)[0], from([5])[0], length];
}
use(read({
  w: [_globalThis]
}), events);