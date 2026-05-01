// static class field with external write through the class binding (`C.x = "..."`).
// instance closure won't match because `C` isn't an instance binding; static pipeline's
// class-binding closure does match. write joins the candidate union, narrow collapses to
// generic. without static/instance split, this write would be missed and `_atMaybeArray`
// would be unsoundly emitted, causing a runtime TypeError on old engines (`it.at` is
// undefined when arr is the reassigned String value)
class C {
  static items = [1, 2, 3];
  static getFirst() { return C.items.at(0); }
}
C.items = "stringified";
C.getFirst();
