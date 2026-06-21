import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// catch destructure with a polyfill in an entry prop's DEFAULT (`it = [9].flat()`) AND in a
// non-entry prop's computed KEY (`[[1].at(0)]`). both extraction paths must coexist over the
// single `_ref` overwrite without orphaning either; the entry is listed FIRST so a non-entry
// polyfilled key before it does not reorder ops between the AST and text plugins. regression lock
try {} catch (_ref) {
  var _ref3, _ref4;
  let _ref2,
    it = (_ref2 = _getIteratorMethod(_ref)) === void 0 ? _flatMaybeArray(_ref4 = [9]).call(_ref4) : _ref2;
  let {
    [_atMaybeArray(_ref3 = [1]).call(_ref3, 0)]: b
  } = _ref;
  b;
  it;
}