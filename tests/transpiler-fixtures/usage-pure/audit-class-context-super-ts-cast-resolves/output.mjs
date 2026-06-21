import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// TS cast around the extends clause: `extends (Base as typeof Base)` parses the super
// expression as a TSAsExpression around the Identifier. peeling the wrapper but then
// dispatching on the RAW super node missed `Base` and over-bailed; dispatching on the
// peeled Identifier restores the super.m() string-return narrow
declare class Base {
  m(): string;
}
class Child extends (Base as typeof Base) {
  use() {
    var _ref;
    return _atMaybeString(_ref = super.m()).call(_ref, 0);
  }
}
new Child().use();