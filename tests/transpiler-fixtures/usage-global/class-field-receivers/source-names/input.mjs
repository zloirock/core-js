// A generated field capture cannot shadow the inner name of a source class expression.
// The class's static receiver remains visible inside each instance's initializer.
export const Box = class _ref {
  static list = [1];
  value = _ref.list.at(0);
};
