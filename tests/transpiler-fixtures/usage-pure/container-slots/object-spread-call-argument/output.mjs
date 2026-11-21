import _Map from "@core-js/pure/actual/map";
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
    k: {
      groupBy
    }
  } = spreadBox;
  return groupBy;
}();
export { escapedBySpread };