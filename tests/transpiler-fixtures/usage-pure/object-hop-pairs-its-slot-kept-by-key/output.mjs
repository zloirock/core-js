import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map";
function keptByKey(key) {
  const ns = {
    Q: Array,
    [key]: _Map
  };
  const {
      Q: _ref
    } = ns,
    kept = _ref === Array ? _Array$of : _ref.of;
  return kept;
}
export default [keptByKey('Q')];