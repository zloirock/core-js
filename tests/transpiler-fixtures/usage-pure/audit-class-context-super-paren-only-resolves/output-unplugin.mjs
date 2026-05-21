import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// plain ParenthesizedExpression around the extends clause without any TS wrapper -
// `extends (Base)`. asserts the resolved-node dispatch handles the Paren-only case
// symmetrically with the TS-cast / non-null variants
declare class Base {
  m(): string;
}
class Child extends (Base) {
  use() {
    var _ref;
    return _atMaybeString(_ref = super.m()).call(_ref, 0);
  }
}
new Child().use();