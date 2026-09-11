// TS non-null assertion around the extends clause: `extends Base!` parses the super
// expression as TSNonNullExpression. peeling TSNonNullExpression (alongside TSAsExpression)
// and dispatching on the peeled Identifier lets the ambient-class fallback resolve `Base`
// for `!`-suffixed extends too, narrowing super.m() to its string return
declare class Base {
  m(): string;
}
class Child extends Base! {
  use() {
    return super.m().at(0);
  }
}
new Child().use();
