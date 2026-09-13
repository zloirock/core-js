import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Map from "@core-js/pure/actual/map";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// A setter does not erase the getter belonging to the same property descriptor.
// Writing Map may leave the getter returning Object; keep the read and its original candidate.
// Pure guards the observed value, and global injects Object.groupBy as well as Map's statics.
const effects = [];
const source = {
  get value() {
    _pushMaybeArray(effects).call(effects, 'get');
    return Object;
  },
  set value(ctor) {
    _pushMaybeArray(effects).call(effects, 'set');
  }
};
source.value = _Map;
const {
    value: _ref
  } = source,
  groupBy = _ref === Object ? _Object$groupBy : _ref.groupBy;
export { groupBy };
export { effects };