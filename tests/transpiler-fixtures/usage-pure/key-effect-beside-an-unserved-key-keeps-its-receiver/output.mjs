import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
var _ref2;
// a key the build serves by no name reads the receiver itself: the reused constructor or the capture
// stays for it, as a dispatch's capture does; the init still runs once, ahead of the first key
export const log = [];
const attempt = (_pushMaybeArray(log).call(log, 'i1'), _pushMaybeArray(log).call(log, 'k1'), _Promise$try),
  {
    [(_pushMaybeArray(log).call(log, 'k2'), 'mine')]: mine
  } = _Promise;
export { attempt, mine };
function make() {
  _pushMaybeArray(log).call(log, 'i2');
  return Array;
}
const _ref = make(),
  of = (_pushMaybeArray(log).call(log, 'k3'), _Array$of),
  {
    [(_pushMaybeArray(log).call(log, 'k4'), 'custom')]: custom
  } = _ref;
export { of, custom };
export const at = (_ref2 = (_pushMaybeArray(log).call(log, 'i3'), [1, 2]), _pushMaybeArray(log).call(log, 'k5'), _atMaybeArray(_ref2));