import _Map from "@core-js/pure/actual/map";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// A container passed through a spread argument can be written by the callee before its slot read.
function consume(first) {
  if (first) first.k = _Map;
}
const escapedBySpread = function () {
  const spreadBox = {
    k: Object
  };
  consume(...[spreadBox]);
  const {
      k: _ref
    } = spreadBox,
    groupBy = _ref === Object ? _Object$groupBy : _ref.groupBy;
  return groupBy;
}();
export { escapedBySpread };