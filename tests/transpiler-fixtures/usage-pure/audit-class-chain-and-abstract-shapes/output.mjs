import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3, _ref4;
// two boundaries of "which member answers a read". first, the walk up the superclass chain may be
// cut short - a cycle stops it, and so does the depth cap - and an ancestor field could still be out
// there, so the accessor found nearest must NOT be taken: the read stays undecided and dispatch goes
// through the type-agnostic entry. the rest are the declared shapes each parser spells differently:
// an abstract field, an abstract auto-accessor and an abstract method reached through a type
// reference all carry their annotation and must resolve on both. `at` and `includes` are the only
// methods with both an array and a string variant, so they are what makes "resolved to array"
// distinguishable from "not resolved at all"
class Cyclic extends Other {
  get a() {
    return "s";
  }
}
class Other extends Cyclic {}
_includes(_ref = new Cyclic().a).call(_ref, 1);
abstract class Shapes {
  abstract b: number[];
  abstract accessor c: number[];
  abstract d(): number[];
}
declare const shapes: Shapes;
_atMaybeArray(_ref2 = shapes.b).call(_ref2, 0);
_includesMaybeArray(_ref3 = shapes.c).call(_ref3, 1);
_atMaybeArray(_ref4 = shapes.d()).call(_ref4, 0);