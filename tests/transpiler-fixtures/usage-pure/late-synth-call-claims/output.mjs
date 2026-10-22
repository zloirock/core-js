import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
const log = [];
export const result = (({
  of,
  length
}) => [of(3), length])(function (_ref) {
  return {
    of: _Array$of,
    length: _ref.length
  };
}((() => {
  var _ref2;
  return (_pushMaybeArray(log) || 0).call(log, _atMaybeArray(_ref2 = [7]).call(_ref2, 0)), Array;
})()));
export { log };