import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A split pattern keeps the initializer prefix before its first computed hop.
// Reusing the source binding must preserve the prefix and serve the captured method.
const events = [];
const source = {
  row: [5, 6],
  other: 1
};
const {
    [(_pushMaybeArray(events).call(events, 'key'), 'row')]: _ref
  } = (_pushMaybeArray(events).call(events, 'prefix'), source),
  at = _atMaybeArray(_ref),
  {
    other
  } = source;
export { at, other, events };