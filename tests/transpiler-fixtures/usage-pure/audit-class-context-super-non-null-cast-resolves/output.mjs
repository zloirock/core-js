import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// TS non-null assertion around the extends clause: `extends Base!` parses superClass as
// TSNonNullExpression. `resolveRuntimeExpression` peels TSNonNullExpression alongside
// TSAsExpression; using the peeled `resolved.node` in the Identifier branch makes the
// ambient-class fallback work for `!`-suffixed extends too
declare class Base {
  m(): string;
}
class Child extends Base! {
  use() {
    var _ref;
    return _atMaybeString(_ref = super.m()).call(_ref, 0);
  }
}
new Child().use();