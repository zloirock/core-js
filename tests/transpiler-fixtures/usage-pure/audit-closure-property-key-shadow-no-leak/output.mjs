import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Object-literal property key shares a name with a closure binding. estree-toolkit's
// Identifier visitor walks property keys; without `isNonReferencePosition` filtering, the
// key `c` would register as a reference to the closure binding `c`, classify as 'extraction'
// in classifyClosureRef, and trigger `'leak'` in defaultAliasRefClassifier. The closure
// then bails to null and the narrow disables. with the filter, property-key occurrences
// stay invisible to the binding-ref index and the closure scan completes cleanly
class C {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _atMaybeArray(_ref = this.items).call(_ref, 0);
  }
}
function probe() {
  const c = new C();
  const meta = {
    c: 'unrelated-key'
  };
  return [c.getFirst(), meta];
}
probe();