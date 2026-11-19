import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// A local property read does not invalidate later reads of the argument's field.
function pick(o: {
  rows: unknown;
}) {
  return o.rows;
}
const box = {
  rows: [8, 9]
};
void pick(box);
use(_atMaybeArray(_ref = box.rows).call(_ref, -1));