// StaticBlock + assertion-statement sibling guard (`assertArray(x)` shape - asserts
// predicate). exercises the OTHER branch of parseSiblingGuards (parseAssertionStatementGuard)
// reachable via getStatementSiblings now that StaticBlock is recognised as a body-list
// container. previously the assertion-style narrow inside `static { ... }` was lost
declare const x: string | string[];
declare function assertArray<T>(v: unknown): asserts v is T[];
class Holder {
  static {
    assertArray<string>(x);
    x.at(0);
  }
}
Holder;
