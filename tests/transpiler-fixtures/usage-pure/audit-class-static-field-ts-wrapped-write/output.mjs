import _at from "@core-js/pure/actual/instance/at";
// `(C as any).items = "stringified"` - TS-wrapped receiver on a static-field external write.
// the closure-build walker peels TS_EXPR_WRAPPERS around each ref so `(C as any).items`
// sees its OUTER context (MemberExpression{object: TSAsExpression}) as the semantic parent
// and `isMemberRefReceiver` returns trivial instead of leak. pushIfWriteMatches +
// isReceiverInClosure mirror the peel on the write side. without both peels, the closure
// either bails entirely (build-time leak misclassify) or fails to match the receiver
// (write-time identity check), leaving narrow on Array and emitting `_atMaybeArray` unsoundly
class C {
  static items = [1, 2, 3];
  static getFirst() {
    var _ref;
    return _at(_ref = C.items).call(_ref, 0);
  }
}
(C as any).items = "stringified";
C.getFirst();