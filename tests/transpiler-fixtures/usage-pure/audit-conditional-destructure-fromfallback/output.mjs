import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
// destructure with a conditional fallback init: the polyfill rewrite still threads
// through both branches consistently.
const cond = Math.random() > 0.5;
const {
  from
} = cond ? {
  from: _Array$from
} : _Set;
from([1, 2, 3]);