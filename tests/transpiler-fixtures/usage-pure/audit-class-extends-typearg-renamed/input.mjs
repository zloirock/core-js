// Class extends Parent<RenamedTypeArg> — child uses different parameter name than parent.
// collectClassLikeMembers per §6 has accepted limit "parent classes with their own params remain a known precision-edge"
// — but the comment in line 1147 says "root-class type-params apply through inheritance chain".
// Edge: child's typeParam different name than parent's. Let's see if it works.
class Parent<X> {
  data: X = null!;
}
class Child<Y> extends Parent<Y[]> {
  outer: Y = null!;
}
declare const c: Child<string>;
c.data.at(0);
