import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A decided fallback leaves only the live initializer effect in the loop header.
// The extracted static is always defined, so its default never runs.
const events = [];
let result;
for (var read = (_pushMaybeArray(events).call(events, 'init'), _Array$from); result === undefined;) {
  result = read([4, 6]);
}
export { result, events };