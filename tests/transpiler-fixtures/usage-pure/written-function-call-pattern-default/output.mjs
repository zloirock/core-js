import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// An undefined argument activates the written function's destructured default.
const box = {};
box.fn = ({
  rows
} = {
  rows: [8, 9]
}) => rows;
use(_atMaybeArray(_ref = box.fn(undefined)).call(_ref, -1));