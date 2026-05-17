// TS cast around the extends clause: `extends (Base as typeof Base)` parses superClass
// as TSAsExpression around the Identifier. `resolveSuperClassPath` peels via
// `resolveRuntimeExpression` but then dispatched on the RAW `superClass.node` for the
// Identifier/ambient branch - bug missed `Base` and over-bailed. fix dispatches on the
// peeled `resolved.node`, restoring the super.m() string-return narrow
declare class Base {
  m(): string;
}
class Child extends (Base as typeof Base) {
  use() {
    return super.m().at(0);
  }
}
new Child().use();
