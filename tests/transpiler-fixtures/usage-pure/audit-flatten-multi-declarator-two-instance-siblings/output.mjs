import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// A nested static declarator shares a declaration with two instance destructures.
// All three claims keep their own receivers and source order.
const at = _at(getArr());
const flat = _flatMaybeArray(getArr2());
const {
  Array: {
    from
  }
} = {
  Array: {
    from: _Array$from
  }
};
at;
flat;
from([1]);