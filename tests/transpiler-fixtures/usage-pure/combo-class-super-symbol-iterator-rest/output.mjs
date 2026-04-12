import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _Array$from from "@core-js/pure/actual/array/from";
class A extends Array {
  static f() {
    const _ref = _Array$from.call(this, []);
    const iter = _getIteratorMethod(_ref);
    const {
      [_Symbol$iterator]: _unused,
      ...rest
    } = _ref;
  }
}