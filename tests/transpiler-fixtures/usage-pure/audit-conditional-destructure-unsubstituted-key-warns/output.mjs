import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// An unbound computed key stays in the native pattern and may still throw.
// The preceding named static is guarded against the selected constructor.
const cond = true;
const _ref = cond ? Array : _Iterator,
  from = null == _ref ? _ref[""] : _ref === Array ? _Array$from : _ref === _Iterator ? _Iterator$from : _ref["from"],
  {
    [appProvidedKey]: ctor
  } = _ref;
from([1, 2, 3]);
ctor;