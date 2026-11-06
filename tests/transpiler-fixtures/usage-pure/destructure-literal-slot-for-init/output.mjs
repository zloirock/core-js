import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A loop initializer retains every literal slot before its instance extraction.
// Both getter reads keep their order and execute once.
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
for (var {
    y: _ref
  } = {
    y: source.y,
    z: source.z
  }, includes = _includesMaybeArray(_ref); !includes;) break;