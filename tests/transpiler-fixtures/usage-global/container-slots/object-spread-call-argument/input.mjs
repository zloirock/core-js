// A container passed through a spread argument can be written by the callee before its slot read.
function consume(first) { if (first) first.k = Map; }
const escapedBySpread = (function () {
  const spreadBox = { k: Object };
  consume(...[spreadBox]);
  const { k: { groupBy } } = spreadBox;
  return groupBy;
})();
export { escapedBySpread };
