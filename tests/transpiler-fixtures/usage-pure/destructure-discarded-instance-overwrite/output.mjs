import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// The instance dispatch reuses its literal slot. Other initializer effects still
// run before the overwrite after the nested assignment pattern has disappeared.
const events = [];
const values = [7, 8];
let read;
({
  before: _pushMaybeArray(events).call(events, 'before'),
  y: values,
  after: _pushMaybeArray(events).call(events, 'after')
});
read = _atMaybeArray(values);
export { read, events };