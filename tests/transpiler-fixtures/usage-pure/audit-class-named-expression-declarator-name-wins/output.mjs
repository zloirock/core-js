import _at from "@core-js/pure/actual/instance/at";
// `const C = class XYZ {}` - inner `XYZ` is a class-body-only binding; every external
// reference uses `C` (the declarator name). canonical class binding name must prefer the
// declarator over class-id, otherwise external `C.box = "x"` writes are missed (closure
// scans for `XYZ` references, finds none, fold drops the write)
const C = class XYZ {
  static box = [1, 2, 3];
  static first() {
    var _ref;
    return _at(_ref = C.box).call(_ref, 0);
  }
};
C.box = "x";
C.first();