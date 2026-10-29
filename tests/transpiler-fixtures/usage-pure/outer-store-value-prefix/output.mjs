import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _self from "@core-js/pure/actual/self";
// Effects inside a saved realm value precede the setter. The surrounding prefix
// stays outside the store, and the unbacked tail reads the value the setter received.
const log = [];
let stored;
const holder = {
  set value(value) {
    _pushMaybeArray(log).call(log, 'set');
    stored = value;
  }
};
export const result = (_pushMaybeArray(log).call(log, 'outer'), holder.value = (_pushMaybeArray(log).call(log, 'inner'), _self)).window;
export { log, stored };