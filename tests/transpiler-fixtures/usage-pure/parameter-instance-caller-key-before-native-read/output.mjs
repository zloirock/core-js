import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A known caller mirrors instance methods and keeps native reads after key effects.
// The passthrough getter closes over the receiver captured at the argument site.
const events = [];
function read({
  at,
  [(_pushMaybeArray(events).call(events, 'key'), 'flat')]: flat,
  length
}) {
  return [at, flat, length];
}
export const result = read((_ref => {
  return {
    at: _atMaybeArray(_ref),
    get flat() {
      return _flatMaybeArray(_ref);
    },
    get length() {
      return _ref.length;
    }
  };
})(Array.prototype));