import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
var _ref2;
// an effectful-key pattern written over a selection the build decides behind an effect prefix plans
// over the value the selection yields: the static is read off the constructor that runs, as for that
// constructor spelled alone - in an assignment's value, a statement and a declaration with a rest
var groupBy, other, from, of;
export const grouped = () => (eff(), k(), groupBy = _Map$groupBy, {
  other
} = _Map, _Map);
export const listed = () => {
  var _ref;
  return _ref = (eff(), Array), k(), from = _Array$from, _ref;
};
_ref2 = (eff(), Array), k(), of = _Array$of, {
  other
} = _ref2;
const {
  [(k(), 'withResolvers')]: withResolvers,
  ...others
} = (eff(), _Promise);
export { withResolvers, others };