import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// Receiver capture in a parameter default keeps its enclosing lexical environment.
// this, super, arguments and new.target still refer to the source method or constructor.
class Base {
  get data() {
    return [1, [2]];
  }
}
export class Box extends Base {
  read(value = (() => {
    var _ref;
    return _at(_ref = this.data).call(_ref, 0);
  })(), found = (() => {
    var _ref2;
    return _includesMaybeArray(_ref2 = super.data).call(_ref2, 1);
  })(), last = (() => {
    var _ref3, _ref4;
    return null == (_ref3 = arguments[0]) ? void 0 : _findLastMaybeArray(_ref4 = _ref3.data).call(_ref4, Boolean);
  })()) {
    return [value, found, last];
  }
}
function Build(value = (() => {
  var _ref5;
  return _flatMaybeArray(_ref5 = new.target.data).call(_ref5);
})()) {
  this.value = value;
}
Build.data = [1, [2]];
export const constructor = Build;