import _Array$from from "@core-js/pure/actual/array/from";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set";
const from = _Array$from;
// Constructor rest uses the full index where a constructor entry exists.
// Other sources keep their rest exclusions and independently claimed statics.
const {
  from: _unused,
  ...rest
} = _self.Array || _Set;
from([1]);