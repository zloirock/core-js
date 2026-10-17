import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
// A write through a conditional, logical or aliased receiver patches every reachable built-in slot. Later static reads must
// observe that patch through the constructor binding.
let cond;
(cond ? _Map : _Promise).groupBy = patchA;
const r1 = _Map.groupBy(items, fn);
export { r1 };