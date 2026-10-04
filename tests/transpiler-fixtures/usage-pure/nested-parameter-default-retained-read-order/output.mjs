import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// Nested literal defaults retain claimed statics and defer the native sibling until its source position.
const events = [];
function read(_ref = void 0) {
  let _ref3 = false;
  let {
      w: {
        v: _ref2
      }
    } = _ref === void 0 ? (_ref3 = true, {
      w: {
        v: _globalThis
      }
    }) : _ref,
    {} = _ref2,
    {
      Array: _ref4
    } = _ref3 ? {
      "Array": _globalThis.Array
    } : _ref2,
    {} = _ref4,
    {
      of
    } = _ref3 ? {
      of: _Array$of
    } : _ref4,
    {
      [(_pushMaybeArray(events).call(events, 'key'), 'from')]: from
    } = _ref3 ? {
      from: _Array$from
    } : _ref4,
    {
      length
    } = _ref4;
  return [of(4)[0], from([5])[0], length];
}
use(read(), events);