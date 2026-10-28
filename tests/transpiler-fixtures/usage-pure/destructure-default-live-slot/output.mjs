import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
// The receiver getter runs once. The default stays live through child rewrites,
// before a later computed key; that key and the residual keep their source order.
const events = [];
function source() {
  _pushMaybeArray(events).call(events, 'init');
  return {
    get at() {
      _pushMaybeArray(events).call(events, 'get');
    },
    other: 3
  };
}
export function consume(held) {
  var _ref;
  const read = (_ref = _at(held)) === void 0 ? (_pushMaybeArray(events).call(events, 'default'), _Array$from) : _ref;
  const {
    [(_pushMaybeArray(events).call(events, 'key'), 'other')]: other
  } = held;
  return [read({
    0: 7,
    length: 1
  }), other, events];
}
export const result = consume(source());