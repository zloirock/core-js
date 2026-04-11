import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _includes from "@core-js/pure/actual/instance/includes";
const iter = _getIteratorMethod(obj);
const includes = _includes(obj);
const {
  [_Symbol$iterator]: _unused,
  includes: _unused2,
  foo,
  ...rest
} = obj;