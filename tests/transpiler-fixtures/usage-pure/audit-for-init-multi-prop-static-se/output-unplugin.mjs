import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// for-loop init destructuring multiple static properties from a side-effecting
// receiver: the receiver must be evaluated once and shared.
let sideFx = () => 0;
for (const _ref = (sideFx(), Array), from = _Array$from, of = _Array$of; sideFx() < 1;) { from([of(0)]); break; }