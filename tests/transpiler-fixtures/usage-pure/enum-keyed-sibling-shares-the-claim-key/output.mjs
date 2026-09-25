import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// a sibling keyed by an ENUM member resolves its key the way the claim funnel does, so a static
// beside it takes the same memo route on both legs as its literal-keyed twin
enum E {
  name = 'name'
}
let n = 0;
function mk() {
  return Array;
}
const _ref = (n++, mk());
const a = _Array$from;
const nm = _nameMaybeFunction(_ref);
const _ref2 = (n++, mk());
const b = _Array$of;
const nm2 = _nameMaybeFunction(_ref2);
use(a, nm, b, nm2);