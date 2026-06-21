// TS cast around the extends clause: `extends (Base as typeof Base)` parses the super
// expression as a TSAsExpression around the Identifier. peeling the wrapper but then
// dispatching on the RAW super node missed `Base` and over-bailed; dispatching on the
// peeled Identifier restores the super.m() string-return narrow
declare class Base {
  m(): string;
}
class Child extends (Base as typeof Base) {
  use() {
    return super.m().at(0);
  }
}
new Child().use();
