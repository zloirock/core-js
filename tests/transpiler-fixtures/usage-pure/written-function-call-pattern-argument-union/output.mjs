import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// A destructured function result keeps the known families of its field.
// An argument replaces the default with an array or string field.
const box = {};
box.fn = ({
  rows
} = {
  rows: ["a"]
}) => rows;
use(_includes(_ref = box.fn({
  rows: flag ? ["a"] : "ab"
})).call(_ref, "a"));