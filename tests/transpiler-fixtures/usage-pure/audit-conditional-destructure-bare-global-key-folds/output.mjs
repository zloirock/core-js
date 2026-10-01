import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Set from "@core-js/pure/actual/set/constructor";
// An unproven global key prevents a receiver mirror. Each named static is guarded
// against the selected constructor, and the key retains its global polyfill.
const cond = true;
const _ref = cond ? Array : _Iterator,
  from = _ref === Array ? _Array$from : _ref === _Iterator ? _Iterator$from : _ref.from,
  {
    [_Set]: ctor
  } = _ref;
from([1, 2, 3]);
ctor;