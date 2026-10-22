import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
// The default captures an array before the parameter key writes a string.
// Its delayed method read must dispatch on that captured value.
const events = [];
const first = [4, 5];
let current = first;
export function read({
  value: {
    [(_pushMaybeArray(events).call(events, 'key'), current = 'xy', 'at')]: method = () => -1
  }
} = (() => {
  var _ref;
  return {
    value: ((_pushMaybeArray(events) || 0).call(events, _atMaybeArray(_ref = [1]).call(_ref, 0)), (_ref2 => {
      return _ref2 == null ? _ref2 : {
        get at() {
          return _at(_ref2);
        }
      };
    })(current))
  };
})()) {
  return method;
}
read().call(first, -1);