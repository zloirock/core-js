import _Set from "@core-js/pure/actual/set/constructor";
const cond = Math.random() > 0.5;
const {
  from
} = cond ? Array : _Set;
from([1, 2, 3]);