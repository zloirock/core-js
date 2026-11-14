import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// A lowered optional test preserves the early throw without reading the setter target.
export function read(effects) {
  var _ref;
  _globalThis.box = [3];
  const target = {
    get value() {
      throw new Error('getter');
    },
    set value(value) {
      _pushMaybeArray(effects).call(effects, 'write');
    }
  };
  let ref;
  return (ref = function (value) {
    return null == value ? null.self : value;
  }(target.value = _globalThis.window)) == null ? void 0 : _at(_ref = ref[_pushMaybeArray(effects).call(effects, 'key'), 'box']).call(_ref, 0);
}