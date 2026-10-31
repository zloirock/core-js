import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$values from "@core-js/pure/actual/object/values";
// A consumed assignment still reads its getter exactly once inside the branch.
// Keeping the read also keeps the sequence prefix ahead of it.
const events = [];
const source = {
  get constructorValue() {
    _pushMaybeArray(events).call(events, 'getter');
    return Object;
  }
};
let read;
if (take) _pushMaybeArray(events).call(events, 'prefix'), source.constructorValue, read = _Object$values;
export { read, events };