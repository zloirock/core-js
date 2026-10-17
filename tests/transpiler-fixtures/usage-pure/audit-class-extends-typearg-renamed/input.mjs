// `Child<Y> extends Parent<Y[]>` renames the type-param across the boundary.
// Inheritance must rebind by position, not by name, so the parent's `data: X` resolves to `Y[]` -> `string[]`.
class Parent<X> {
  data: X = null!;
}
class Child<Y> extends Parent<Y[]> {
  outer: Y = null!;
}
declare const c: Child<string>;
c.data.at(0);
