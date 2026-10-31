import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A closed caller evaluates its awaited source before capturing the receiver.
// The suspension stays in the async function, and the instance read follows every argument.
const events = [];
function make(value) {
  _pushMaybeArray(events).call(events, value);
  return 'ab';
}
async function run() {
  return ((_ref, other, _unused = void 0) => {
    let at = _atMaybeString(_ref);
    return [at.call('ab', -1), other];
  })(make(await _Promise$resolve('resume')), _pushMaybeArray(events).call(events, 'argument'));
}
export const r = [await run(), events];