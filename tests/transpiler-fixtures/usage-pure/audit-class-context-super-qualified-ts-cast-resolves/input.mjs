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
    return super.m().at(0);
  }
}
new Child().use();
