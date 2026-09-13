import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map";
// The uncertain nested receiver needs a private capture. Exported destructuring exposes
// only the source binding, while its guard still preserves an overriding constructor.
const ns = {
  Q: Array,
  [key]: _Map
};
const {
    Q: _ref
  } = ns,
  method = _ref === Array ? _Array$of : _ref.of;
export { method };