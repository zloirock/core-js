import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A guarded static follows the earlier instance write in a discarded assignment.
// The native sibling retains its source slot; user getters read in property order.
// Global mode keeps the source pattern and supplies its imports.
let M = _Map;
if (flag) M = supplied;
let nm, method, other;
nm = _nameMaybeFunction(M);
method = M === _Map ? _Map$groupBy : M.groupBy;
other = _at(M);
use(nm, method, other);