import _at from "@core-js/pure/actual/instance/at";
class Base {
  touch() {
    this.rows = "text";
  }
}
class WrittenByBase extends Base {
  rows = [1, 2];
  read() {
    var _ref;
    return _at(_ref = this.rows).call(_ref, 0);
  }
}
new WrittenByBase().touch();