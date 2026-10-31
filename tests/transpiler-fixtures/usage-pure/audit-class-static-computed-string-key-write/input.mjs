// computed-key write `C['box'] = "x"` is semantically identical to `C.box = "x"`
// - dispatch must widen to generic exactly the same way
class C {
  static box = [1, 2, 3];
  static first() { return C.box.at(0); }
}
C['box'] = "x";
C.first();
