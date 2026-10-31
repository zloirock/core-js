import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A pattern under a static destructures its ponyfill on declaration and assignment hosts.
// Nested instance claims read that same pure value; defaults stay dead where it is defined.
// Array wrappers, aliases, proxy hops and calls preserve effects and source bindings.
const log = [];
function realm() {
  _pushMaybeArray(log).call(log, 'r');
  return _globalThis;
}
let called;
({
  Array: {
    of: {
      length: called
    }
  }
} = (realm(), {
  Array: {
    of: _Array$of
  }
}));
export { called };
export { log };