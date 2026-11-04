import _includes from "@core-js/pure/actual/instance/includes";
// A private method called through an optional receiver retains its brand and this-value.
export class Box {
  #at() {
    return [2];
  }
  read(box) {
    var _ref, _ref2;
    return null == (_ref = box?.#at) ? void 0 : _includes(_ref2 = _ref.call(box)).call(_ref2, 2);
  }
  first(list) {
    var _ref3;
    return null == (_ref3 = list[0].#at?.()) ? void 0 : (effect(), _includes(_ref3).call(_ref3, 2));
  }
}