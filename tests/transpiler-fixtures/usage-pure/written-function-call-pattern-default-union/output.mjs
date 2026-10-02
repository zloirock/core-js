import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// A destructured function result keeps the known families of its field.
// An omitted argument uses the default field union.
const box = {};
box.fn = ({
  rows
} = {
  rows: flag ? ["a"] : "ab"
}) => rows;
use(_includes(_ref = box.fn()).call(_ref, "a"));