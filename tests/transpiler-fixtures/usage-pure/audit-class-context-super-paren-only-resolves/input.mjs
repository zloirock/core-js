// control for the P15-2 peel-on-resolved fix: a plain ParenthesizedExpression around the
// extends clause without any TS wrapper - `extends (Base)`. asserts the resolved-node
// dispatch handles the Paren-only case symmetrically with the TS-cast / non-null variants
declare class Base {
  m(): string;
}
class Child extends (Base) {
  use() {
    return super.m().at(0);
  }
}
new Child().use();
