import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
const iter = _getIteratorMethod(obj);
const {
  [_Symbol$iterator]: _unused,
  ...rest
} = obj;