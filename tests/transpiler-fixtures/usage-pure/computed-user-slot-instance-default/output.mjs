import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// A user slot default retains its instance receiver.
const userKey = 'userSlotKey';
let at;
({
  [userKey]: {
    at
  } = {
    at: _atMaybeArray([1, 2])
  }
} = _globalThis);
use(at);