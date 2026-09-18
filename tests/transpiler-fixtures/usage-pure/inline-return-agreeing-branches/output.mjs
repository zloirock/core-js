import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Every branch returns the same free constructor. Keep branch effects and inject its static.
export const value = ((() => {
  const local = flag;
  if (local) {
    observe('yes');
    return _Map;
  }
  observe('no');
  return _Map;
})(), _Map$groupBy)([1, 2], value => value % 2);