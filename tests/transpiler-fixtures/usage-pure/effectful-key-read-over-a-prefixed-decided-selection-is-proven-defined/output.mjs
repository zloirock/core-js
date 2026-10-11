import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
var _ref2;
// an effectful-key read over a selection the build decides behind an effect prefix: the receiver is
// the value the selection yields, proven defined as that value spelled alone is, so no nullish test
// stands ahead of the read
const groupBy = (eff(), k(), _Map$groupBy);
const _ref = (eff(), [1]),
  at = (k(), _atMaybeArray(_ref));
var flat;
_ref2 = (eff(), [2]), k(), flat = _flatMaybeArray(_ref2);
export { groupBy, at, flat };