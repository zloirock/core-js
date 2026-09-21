import _Array$from from "@core-js/pure/actual/array/from";
// A computed constructor key with a known string receives the pure static unconditionally.
// An unknown runtime key cannot justify that substitution.
const {
  ['Array']: {
    from
  }
} = {
  Array: {
    from: _Array$from
  }
};
from([1]);