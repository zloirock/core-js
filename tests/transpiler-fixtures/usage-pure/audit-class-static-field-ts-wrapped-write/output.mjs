import _at from "@core-js/pure/actual/instance/at";
// `(C as any).items = "stringified"` - a TS-wrapped receiver on a static-field external
// write. both the closure build AND the write-match must peel the TS wrappers so the ref's
// real parent is the outer MemberExpression{object: TSAsExpression}, not a leak. without both
// peels the closure bails or the receiver match fails, emitting `_atMaybeArray` unsoundly
class C {
  static items = [1, 2, 3];
  static getFirst() {
    var _ref;
    return _at(_ref = C.items).call(_ref, 0);
  }
}
(C as any).items = "stringified";
C.getFirst();