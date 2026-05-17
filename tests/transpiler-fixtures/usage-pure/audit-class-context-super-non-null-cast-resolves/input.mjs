// TS non-null assertion around the extends clause: `extends Base!` parses superClass as
// TSNonNullExpression. `resolveRuntimeExpression` peels TSNonNullExpression alongside
// TSAsExpression; using the peeled `resolved.node` in the Identifier branch makes the
// ambient-class fallback work for `!`-suffixed extends too
declare class Base {
  m(): string;
}
class Child extends Base! {
  use() {
    return super.m().at(0);
  }
}
new Child().use();
