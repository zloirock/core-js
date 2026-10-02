import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// The key runs before the receiver exists and cannot expose that receiver.
// Its unresolved value leaves the explicitly named rows type intact.
const holder = {
  rows: [],
  [sink(this)]() {}
};
_atMaybeArray(_ref = holder.rows).call(_ref, 0);