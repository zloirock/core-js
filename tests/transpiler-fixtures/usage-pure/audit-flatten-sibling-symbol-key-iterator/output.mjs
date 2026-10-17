import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// A symbol-iterator sibling keeps its helper beside the nested static claim.
const {
  Array: {
    from
  }
} = {
  Array: {
    from: _Array$from
  }
};
const it = _getIteratorMethod(obj);
from([1]);
console.log(it);