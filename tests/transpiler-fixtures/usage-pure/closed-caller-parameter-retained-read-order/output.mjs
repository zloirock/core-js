import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Supplied values and defaults keep their source branches and independent claims. Instance claims retain their own receivers.
const events = [];
function read({
  w: [{
    Array: {
      of,
      [(_pushMaybeArray(events).call(events, 'key'), 'from')]: from,
      length
    }
  }]
}) {
  return [of(4)[0], from([5])[0], length];
}
use(read({
  w: [_globalThis]
}), events);