import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
function keptBySpread(extra) {
  const {
      w: {
        Array: _ref
      }
    } = {
      w: _globalThis,
      ...extra
    },
    kept = _ref === Array ? _Array$of : _ref.of;
  return kept;
}
export default [keptBySpread({})];