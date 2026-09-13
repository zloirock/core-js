import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
// A nested assignment writes its first target before evaluating the next outer key.
// An exception in that key keeps the completed write and leaves the next target untouched.
const events = [];
let from = 'old-from';
let keys = 'old-keys';
function nextKey() {
  _pushMaybeArray(events).call(events, typeof from);
  throw 'stop';
}
try {
  var _unused;
  ({
    Array: {
      [(_pushMaybeArray(events).call(events, 'key'), 'from')]: from
    },
    [(nextKey(), 'Object')]: _unused
  } = {
    Array: {
      from: _Array$from
    },
    Object: _globalThis.Object
  });
  keys = _Object$keys;
} catch (error) {
  _pushMaybeArray(events).call(events, error);
}
export const result = [events, typeof from, keys];