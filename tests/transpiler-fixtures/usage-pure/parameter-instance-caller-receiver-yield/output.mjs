import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A closed caller evaluates its yielded source before capturing the receiver.
// The suspension stays in the generator, and the instance read follows every argument.
const events = [];
function make(value) {
  _pushMaybeArray(events).call(events, value);
  return 'ab';
}
function* run() {
  return ((_ref, other, _unused = void 0) => {
    let at = _atMaybeString(_ref);
    return [at.call('ab', -1), other];
  })(make(yield 'pause'), _pushMaybeArray(events).call(events, 'argument'));
}
const iterator = run();
const first = iterator.next();
export const r = [first, iterator.next('resume'), events];