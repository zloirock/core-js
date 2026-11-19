import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _Array$of from "@core-js/pure/actual/array/of";
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
e++, o = _Array$of, from = _Array$from;
for (const _ref = obj.recv, fli = null == _ref ? _ref[""] : (eff(), _findLastIndexMaybeArray(_ref)), a = _atMaybeArray(_ref); !done;) done = [fli, a];
export const r = [from, o, done];