// qualified-segments branch of `extends (NS.Base as typeof NS.Base)` peels to
// MemberExpression `NS.Base`. without using the peeled `resolved.node` in the
// qualified-segments fallback, `collectQualifiedSegments(superClass.node)` walks into a
// TSAsExpression that has no segment shape and returns null - parent resolution lost
declare namespace NS {
  class Base {
    m(): string;
  }
}
class Child extends (NS.Base as typeof NS.Base) {
  use() {
    return super.m().at(0);
  }
}
new Child().use();
