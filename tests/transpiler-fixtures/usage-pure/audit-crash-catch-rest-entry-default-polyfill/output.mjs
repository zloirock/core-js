import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// catch destructure with a ...rest sibling AND an entry prop whose default is polyfillable
// (`it = [9].flat()`). the entry's default is emitted as a standalone let-decl (with the baked
// default) BEFORE the rest-gather pattern is rebuilt; the rebuilt pattern reserves a `_unused`
// slot for the entry's key so rest exclusion still works. both must hold. regression lock
try {} catch (_ref) {
  var _ref3;
  let _ref2,
    it = (_ref2 = _getIteratorMethod(_ref)) === void 0 ? _flatMaybeArray(_ref3 = [9]).call(_ref3) : _ref2;
  let {
    [_Symbol$iterator]: _unused,
    ...rest
  } = _ref;
  it;
  rest;
}