import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A guarded static beside an extracted instance leaf retains the same narrow guard.
// Pending instance writes stay before the static; the native trailing slot survives.
let M = _Map;
if (flag) M = {
  groupBy: 7,
  name: 'user'
};
const nm = _nameMaybeFunction(M);
const method = M === _Map ? _Map$groupBy : M.groupBy,
  {
    at: other
  } = M;
use(nm, method, other);