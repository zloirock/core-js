import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// A native nested pattern stays before the typed method read of its sibling.
const events = [];
const item = {
  get at() {
    _pushMaybeArray(events).call(events, 'at');
    return () => 3;
  },
  get other() {
    _pushMaybeArray(events).call(events, 'other');
    return 5;
  }
};
const receiver = {
  get w() {
    _pushMaybeArray(events).call(events, 'w');
    return item;
  },
  y: 'abc'
};
const [_ref] = [receiver, _pushMaybeArray(events).call(events, 'rhs')];
const {
  w: {
    at,
    other
  }
} = _ref;
const includes = _includesMaybeString(_ref.y);
export { at, other, includes, events };