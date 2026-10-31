import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
const userObj = {
  Set: function () {}
};
const [{
  Set: A
}, {
  Map: M
}] = [userObj, _globalThis];
export const viaGlobalElem = _Map$groupBy([], x => x);