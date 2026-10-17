import _at from "@core-js/pure/actual/instance/at";
// a static field is written externally through the class binding (`C.x = "..."`). the
// instance closure won't match (`C` is not an instance binding); only a class-binding closure
// folds the write into the candidate union, collapsing the narrow to generic. without the
// static/instance split the write is missed and `_atMaybeArray` emits, throwing on old engines
class C {
  static items = [1, 2, 3];
  static getFirst() {
    var _ref;
    return _at(_ref = C.items).call(_ref, 0);
  }
}
C.items = "stringified";
C.getFirst();