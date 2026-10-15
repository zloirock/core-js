import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
var _ref, _ref2;
// Literal getter slots retain their evaluation order before an assignment's instance read.
// Either sibling order captures the actual receiver and serves its own distinct method.
const events = [];
const source = {
  get y() {
    _pushMaybeArray(events).call(events, 'y');
    return [1, 2];
  },
  get z() {
    _pushMaybeArray(events).call(events, 'z');
    return 1;
  }
};
let at, includes;
({
  y: _ref
} = {
  z: source.z,
  y: source.y
}), at = _atMaybeArray(_ref);
({
  y: _ref2
} = {
  y: source.y,
  z: source.z
}), includes = _includesMaybeArray(_ref2);