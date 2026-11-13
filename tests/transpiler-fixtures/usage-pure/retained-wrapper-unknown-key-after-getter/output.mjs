import _pushMaybeArray from "@core-js/pure/full/array/instance/push";
import _Map from "@core-js/pure/full/map/constructor";
import _Map$groupBy from "@core-js/pure/full/map/group-by";
// The retained pattern reads the constructor static from its literal slot.
// Computed keys, accessors and overrides keep their native evaluation order.
export const effects = [];
const k = String('w');
const {
    w: _ref
  } = {
    get w() {
      _pushMaybeArray(effects).call(effects, 'get');
      return _Map;
    },
    [k]: {
      groupBy: () => 23
    }
  },
  groupBy = _ref === _Map ? _Map$groupBy : _ref.groupBy;
export const r = groupBy([1, 2, 3], value => value % 2);