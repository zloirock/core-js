import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map";
// A nested assignment reads its uncertain slot before assigning the extracted static.
// The later computed property may win, so the runtime receiver selects the static.
function read(key) {
  var _ref;
  const ns = {
    Q: Array,
    [key]: _Map
  };
  let method;
  ({
    Q: _ref
  } = ns), method = _ref === Array ? _Array$of : _ref.of;
  return method;
}
export const kinds = [typeof read('other'), typeof read('Q')];