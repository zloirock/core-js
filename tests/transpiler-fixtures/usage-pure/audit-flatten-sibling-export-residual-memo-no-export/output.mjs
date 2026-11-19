import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
// An exported static and a captured instance sibling keep their public bindings.
// Internal receiver temporaries remain private.
export const {
  Array: {
    from
  }
} = {
  Array: {
    from: _Array$from
  }
};
const _ref = getArr();
export const at = _at(_ref);
export const {
  other
} = _ref;
from([1]);
console.log(at, other);