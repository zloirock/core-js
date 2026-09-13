import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// The slot captured the realm's Array before entering the inner scope. Its uncertain
// read must compare against that constructor even when the local Array name holds Map.
function read(key) {
  const ns = {
    Q: Array,
    [key]: _Map
  };
  return function capture(Array) {
    const {
        Q: _ref
      } = ns,
      method = _ref === _globalThis.Array ? _Array$of : _ref.of;
    return [method, Array];
  }(_Map);
}
export const kinds = [typeof read('other')[0], typeof read('Q')[0]];