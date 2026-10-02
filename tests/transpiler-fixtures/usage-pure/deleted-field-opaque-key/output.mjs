import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// Removing an own field can reveal a different inherited receiver family.
const effects = [];
const box = {
  __proto__: {
    data: "pq"
  },
  data: [8, 9]
};
function key() {
  _pushMaybeArray(effects).call(effects, "delete");
  return "data";
}
delete box[key()];
const r = _at(_ref = box.data).call(_ref, -1);
use(r, effects);