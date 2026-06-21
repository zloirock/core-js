import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `extends (NS.Base as typeof NS.Base)` must peel the TSAsExpression to the inner
// MemberExpression `NS.Base` before collecting its qualified segments. dispatching on the
// raw super node instead walks into a TSAsExpression that has no segment shape and yields
// null, losing parent resolution and the super.m() string-return narrow
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