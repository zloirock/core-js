import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map";
// An unknown later key may replace the named Array slot with Map. The possible Array
// static still needs its polyfill, while a read from the overriding value stays intact.
function read(key) {
  const ns = {
    Q: Array,
    [key]: _Map
  };
  const {
      Q: _ref
    } = ns,
    method = _ref === Array ? _Array$of : _ref.of;
  return method;
}
export const kinds = [typeof read('other'), typeof read('Q')];