import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _includes from "@core-js/pure/actual/instance/includes";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
export const iter = _getIteratorMethod(obj);
export const includes = _includes(obj);
export const {
  [_Symbol$iterator]: _unused,
  includes: _unused2,
  ...rest
} = obj;