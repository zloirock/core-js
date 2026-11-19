import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// Retain the actual inner-default receiver. Keys and repeated native reads keep their slots.
const events = [];
const [{
  Array: {
    of
  },
  [(_pushMaybeArray(events).call(events, 'key'), 'with-dash')]: dash,
  sibling: first,
  sibling: second
} = {
  Array: {
    of: _Array$of
  },
  get "with-dash"() {
    return _globalThis["with-dash"];
  },
  get sibling() {
    return _globalThis.sibling;
  }
}] = [];
use(of(7), dash, first, second, events);