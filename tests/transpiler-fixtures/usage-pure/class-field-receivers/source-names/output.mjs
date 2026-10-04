import _at from "@core-js/pure/actual/instance/at";
// A generated field capture cannot shadow the inner name of a source class expression.
// The class's static receiver remains visible inside each instance's initializer.
export const Box = class _ref {
  static list = [1];
  value = (() => {
    var _ref2;
    return _at(_ref2 = _ref.list).call(_ref2, 0);
  })();
};