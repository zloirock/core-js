import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
let cache;
for (const {
  D: {
    groupBy
  }
} of [cache = {
  D: _Map
}]) console.log(groupBy);
const box = {
  D: _Promise
};
for (const {
  D: {
    allSettled
  }
} of [box]) console.log(allSettled);