import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// An instance read after a guarded static retains the intervening native read.
// Capturing after the detached guard keeps every binding exactly once.
let M = _Map;
if (flag) M = {
  name: 'user',
  at: 8,
  groupBy: 7
};
const method = M === _Map ? _Map$groupBy : M.groupBy,
  _ref = M,
  {
    at: other
  } = _ref,
  nm = null == _ref ? _ref[""] : _nameMaybeFunction(_ref);
use(method, other, nm);