import _at from "@core-js/pure/actual/instance/at";
// a STATIC slot is writable through the class binding too, which the this-write index alone
// does not see
class StaticSide {
  static list() {
    return [5, 6];
  }
  static swap() {
    StaticSide.list = () => "text";
  }
  static read() {
    var _ref;
    return _at(_ref = StaticSide.list()).call(_ref, 1);
  }
}
export const values = [StaticSide.read()];