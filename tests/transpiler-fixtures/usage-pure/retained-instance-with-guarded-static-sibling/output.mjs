import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
var _ref;
// A retained instance capture keeps the constructor guard of its later static sibling.
// A supplied object keeps its own getters and values in source property order.
const log = [];
let M = _Map;
if (supplied) M = {
  get name() {
    _pushMaybeArray(log).call(log, 'name');
    return 'user';
  },
  get groupBy() {
    _pushMaybeArray(log).call(log, 'groupBy');
    return 7;
  },
  get at() {
    _pushMaybeArray(log).call(log, 'at');
    return 8;
  }
};
let nm, method, other;
_ref = M, other = _at(_ref), _ref, nm = _nameMaybeFunction(_ref), method = _ref === _Map ? _Map$groupBy : _ref.groupBy, _ref;
use(nm, method, other, log);