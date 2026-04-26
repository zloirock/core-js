import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// optional chain with a Unicode LINE SEPARATOR between segments: line tracking must
// round-trip correctly through the rewrite.
const obj = {
  prop: [1]
};
obj == null ? void 0 : _atMaybeArray(_ref = obj.prop).call(_ref, 0);