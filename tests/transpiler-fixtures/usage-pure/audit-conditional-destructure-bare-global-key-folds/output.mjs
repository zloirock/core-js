import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator";
import _Set from "@core-js/pure/actual/set/constructor";
// An unproven global key prevents a receiver mirror. Each named static is guarded
// against the selected constructor, and the key retains its global polyfill.
const cond = true;
const from = _Array$from;
const {
  [_Set]: ctor
} = cond ? Array : _Iterator;
from([1, 2, 3]);
ctor;