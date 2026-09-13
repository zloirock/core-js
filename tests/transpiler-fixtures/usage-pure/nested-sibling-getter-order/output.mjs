import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// The nested method read stays between its earlier and later ordinary getters.
// Capturing the receiver must preserve each sibling read once, in source order.
const events = [];
const source = {
  get before() {
    _pushMaybeArray(events).call(events, 'before');
    return 1;
  },
  get slot() {
    _pushMaybeArray(events).call(events, 'slot');
    return [4, 8];
  },
  get after() {
    _pushMaybeArray(events).call(events, 'after');
    return 2;
  }
};
const _ref = source;
const {
  before
} = _ref;
const at = _atMaybeArray(_ref.slot);
const {
  after
} = _ref;
export { before, at, after };