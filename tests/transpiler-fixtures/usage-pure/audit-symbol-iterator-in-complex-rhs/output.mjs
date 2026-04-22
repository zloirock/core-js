import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _isIterable from "@core-js/pure/actual/is-iterable";
const k = _Symbol$iterator;
const obj = {
  data: [1, 2, 3]
};
_isIterable(obj.data);