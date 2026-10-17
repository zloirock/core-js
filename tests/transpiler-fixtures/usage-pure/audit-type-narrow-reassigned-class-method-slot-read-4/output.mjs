import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// an untouched static slot still narrows
class StaticIntact {
  static kept() {
    return [7, 8];
  }
  static read() {
    var _ref;
    return _includesMaybeArray(_ref = StaticIntact.kept()).call(_ref, 7);
  }
}
export const values = [StaticIntact.read()];