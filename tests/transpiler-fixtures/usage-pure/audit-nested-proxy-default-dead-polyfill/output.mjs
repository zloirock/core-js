import _Array$from from "@core-js/pure/actual/array/from";
// A known static binds the pure method even when a native implementation exists.
// Its user default stays dead because the pure import is defined.
const {
  Array: {
    from = []
  }
} = {
  Array: {
    from: _Array$from
  }
};
from([1, 2, 3]);