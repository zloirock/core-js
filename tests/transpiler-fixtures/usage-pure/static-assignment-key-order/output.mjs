import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Each computed key precedes its own assignment and follows the previous one.
// A claimed static binds the pure method even with a native present; its user default
// is dead. The next key observes the assigned method rather than its old value.
const events = [];
let method;
let isArray;
_pushMaybeArray(events).call(events, typeof method), method = _Array$from, {
  [(_pushMaybeArray(events).call(events, typeof method), 'isArray')]: isArray
} = Array;
export const result = [method('ab'), isArray([]), events];