import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A surviving sibling shares the computed root with the nested dispatch.
// The receiver and its getter run once, after preceding declarators.
const effects = [];
function source() {
  _pushMaybeArray(effects).call(effects, 'source');
  return {
    get data() {
      _pushMaybeArray(effects).call(effects, 'data');
      return [1, 2];
    },
    other: 3
  };
}
const lead = (_pushMaybeArray(effects).call(effects, 'lead'), 1);
const _ref = source();
const at = _atMaybeArray(_ref.data);
const {
  other
} = _ref;
export { lead, at, other, effects };