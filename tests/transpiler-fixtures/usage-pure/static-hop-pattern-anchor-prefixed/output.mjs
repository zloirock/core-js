import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
// A pattern under a static destructures its ponyfill on declaration and assignment hosts.
// Nested instance claims read that same pure value; defaults stay dead where it is defined.
// Array wrappers, aliases, proxy hops and calls preserve effects and source bindings.
const log = [];
const {
  Array: {
    of: {
      length: prefixed
    }
  }
} = (_pushMaybeArray(log).call(log, 'e'), {
  Array: {
    of: _Array$of
  }
});
export { prefixed };
export { log };