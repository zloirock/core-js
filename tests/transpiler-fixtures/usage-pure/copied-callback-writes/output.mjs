import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// A rewritten outer method keeps the callback's assignments and later receiver reads.
// Each read observes its reaching value, even when successive writes change its family.
const effects = [];
const result = _mapMaybeArray(_ref = [[1, 2], [3, 4]]).call(_ref, (rows, index) => {
  rows = ((_pushMaybeArray(effects) || 0).call(effects, `read${index}`), index ? 'cd' : _sliceMaybeArray(rows).call(rows));
  const first = _at(rows).call(rows, 0);
  rows = ((_pushMaybeArray(effects) || 0).call(effects, `write${index}`), index ? [7, 8] : 'ab');
  return [first, _at(rows).call(rows, -1), _includes(rows).call(rows, index ? 8 : 'b')];
});
export { result, effects };