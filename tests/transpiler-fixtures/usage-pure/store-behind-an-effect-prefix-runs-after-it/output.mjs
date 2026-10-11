import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a store behind an effect prefix runs after it: the prefix lifts first and the store lands between it and
// the extractions it feeds, for one extraction and for several
var one, two;
setup();
one = {
  C: _Map
};
export const groupBy = _Map$groupBy;
setup();
two = {
  C: Array,
  D: Array
};
export const from = _Array$from;
export const of = _Array$of;
export { one, two };