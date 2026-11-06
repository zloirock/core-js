import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// A complete caller census supplies a realm inside a literal spine.
// The retained native pattern still evaluates its effectful key before later bindings.
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