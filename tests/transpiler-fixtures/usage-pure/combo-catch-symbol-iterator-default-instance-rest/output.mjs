import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _includes from "@core-js/pure/actual/instance/includes";
try {} catch (_ref) {
  var _ref2;
  let iter = _getIteratorMethod(_ref);
  let includes = (_ref2 = _includes(_ref)) === void 0 ? fb : _ref2;
  let {
    [_Symbol$iterator]: _unused,
    includes: _unused2,
    ...rest
  } = _ref;
  iter();
  includes("x");
}