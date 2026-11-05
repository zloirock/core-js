import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// A literal-container parameter default retains native slot reads and computed-key order.
// The key runs only when its pattern consumes that level.
const events = [];
function read({
  w: {
    v: {
      Array: {
        of,
        [(_pushMaybeArray(events).call(events, 'key'), 'from')]: from,
        length
      }
    }
  }
} = {
  w: {
    v: _globalThis
  }
}) {
  return [of(4)[0], from([5])[0], length];
}
use(read(), events);