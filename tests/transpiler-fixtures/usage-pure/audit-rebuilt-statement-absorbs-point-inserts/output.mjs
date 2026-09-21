import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref;
// Rebuilding an assignment or loop header must preserve every sibling binding and inner claim.
// Each receiver is captured before its computed key, followed by the selected property read;
// later declarators can observe the completed bindings.
const obj = {
  recv: [1]
};
let e = 0,
  from,
  o;
let done = false;
function eff() {
  return 0;
}
_ref = Array, null == _ref ? _ref[""] : (e++, o = _Array$of), from = _Array$from, _ref;
for (const _ref2 = obj.recv, fli = null == _ref2 ? _ref2[""] : (eff(), _findLastIndexMaybeArray(_ref2)), a = _atMaybeArray(_ref2); !done;) done = [fli, a];
export const r = [from, o, done];