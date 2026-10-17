import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
export class Box {
  items = [];
  trim(fn) {
    var _ref, _ref2;
    return null == (_ref = this.items) ? void 0 : (_flatMaybeArray(_ref) || 0).call(_ref, _findIndexMaybeArray(_ref2 = this.items).call(_ref2, fn));
  }
}