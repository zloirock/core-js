import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// An unresolved computed sibling retains the explicitly named array slot.
// Only array at is needed when the runtime key names an unrelated property.
function read(key) {
  var _ref;
  const box = {
    get rows() {
      return [8, 9];
    },
    set rows(value) {},
    [key]: 0
  };
  return _atMaybeArray(_ref = box.rows).call(_ref, -1);
}
use(read("meta"));