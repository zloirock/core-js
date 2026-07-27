// two boundaries of "which member answers a read". first, the walk up the superclass chain may be
// cut short - a cycle stops it, and so does the depth cap - and an ancestor field could still be out
// there, so the accessor found nearest must NOT be taken: the read stays undecided and dispatch goes
// through the type-agnostic entry. the rest are the declared shapes each parser spells differently:
// an abstract field, an abstract auto-accessor and an abstract method reached through a type
// reference all carry their annotation and must resolve on both. `at` and `includes` are the only
// methods with both an array and a string variant, so they are what makes "resolved to array"
// distinguishable from "not resolved at all"
class Cyclic extends Other { get a() { return "s"; } }
class Other extends Cyclic {}
new Cyclic().a.includes(1);
abstract class Shapes {
  abstract b: number[];
  abstract accessor c: number[];
  abstract d(): number[];
}
declare const shapes: Shapes;
shapes.b.at(0);
shapes.c.includes(1);
shapes.d().at(0);
