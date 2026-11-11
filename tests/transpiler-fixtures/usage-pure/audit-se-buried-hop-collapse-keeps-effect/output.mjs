import _Array$from from "@core-js/pure/actual/array/from";
import _self from "@core-js/pure/actual/self";
// An effect inside a proxy member runs once before any binding. The captured receiver
// keeps the extracted static before its following native sibling.
const _ref = (eff(), _self).Array,
  from = _Array$from,
  {
    custom
  } = _ref;
from([1]);
custom();