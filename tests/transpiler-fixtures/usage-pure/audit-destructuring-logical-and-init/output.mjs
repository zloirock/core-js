import _Array$from from "@core-js/pure/actual/array/from";
import _Promise from "@core-js/pure/actual/promise/constructor";
// destructure with `&&` logical-and init: when the LHS is truthy, both branches must
// produce a consistent polyfill rewrite shape.
const {
  from
} = {
  from: _Array$from
} && _Promise;