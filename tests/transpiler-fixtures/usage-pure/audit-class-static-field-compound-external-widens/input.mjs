// external compound assignment to a static class field (`C.box += "x"`) is operator-coerced -
// the result type depends on both operands, can't be type-precise. write must still register
// in the module index so the field-flow fold widens to generic dispatch instead of preserving
// the init-derived array narrow that runtime coercion may have invalidated
class C {
  static box = [1, 2, 3];
  static first() { return C.box.at(0); }
}
C.box += "x";
C.first();
