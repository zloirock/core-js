import _Array$of from "@core-js/pure/actual/array/of";
// An unknown later key may replace the named slot with a different built-in.
// An identity guard selects that candidate while preserving the other receiver.
const ns = {
  Q: Object,
  [key]: Array
};
const {
    Q: _ref
  } = ns,
  method = _ref === Array ? _Array$of : _ref.of;
use(method);