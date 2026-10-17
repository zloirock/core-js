import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator";
// An unbound computed key stays in the native pattern and may still throw.
// The preceding named static is guarded against the selected constructor.
const cond = true;
const from = _Array$from;
const {
  [appProvidedKey]: ctor
} = cond ? Array : _Iterator;
from([1, 2, 3]);
ctor;