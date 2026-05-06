import _Promise from "@core-js/pure/actual/promise/constructor";
import _Array$from from "@core-js/pure/actual/array/from";
// destructure with `&&` logical-and init in reversed operand order: the polyfill
// rewrite must still resolve the receiver consistently.
const {
  from
} = _Promise && {
  from: _Array$from
};