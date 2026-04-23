// public field with a concrete init and no external reassign in the class body - a tempting
// narrow target, but `new C().box = 'str'` from outside is legal and would break a
// narrowed polyfill. no annotation -> unknown type, generic polyfill
class C {
  box = [1, 2, 3];
  first() { return this.box.at(0); }
}
