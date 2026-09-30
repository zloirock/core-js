import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A detached static guard follows a native slot in a discarded assignment.
// Getter reads and the earlier instance write retain their source positions.
// Global mode keeps the source pattern and supplies its imports.
const events = [];
let M = _Map;
if (flag) M = {
  get name() {
    _pushMaybeArray(events).call(events, 'name');
    return 'user';
  },
  get groupBy() {
    _pushMaybeArray(events).call(events, 'groupBy');
    return 7;
  },
  get at() {
    _pushMaybeArray(events).call(events, 'at');
    return 8;
  }
};
let nm, method, other;
nm = _nameMaybeFunction(M);
({
  at: other
} = M);
method = M === _Map ? _Map$groupBy : M.groupBy;
use(nm, method, other, events);