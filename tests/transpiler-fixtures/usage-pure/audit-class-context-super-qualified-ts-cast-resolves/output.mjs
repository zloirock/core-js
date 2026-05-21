import _atMaybeString from "@core-js/pure/actual/string/instance/at";
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
    var _ref;
    return _atMaybeString(_ref = super.m()).call(_ref, 0);
  }
}
new Child().use();