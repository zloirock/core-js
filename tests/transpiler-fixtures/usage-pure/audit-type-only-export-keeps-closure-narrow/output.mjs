import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `export type { C }` is tsc-elided at runtime - the class isn't externally reachable
// for static-field mutation. closure-narrow must keep the class-instance scope intact so
// `this.items.at(0)` resolves to array-specific `_atMaybeArray` instead of bailing to
// the generic `instance/at`. covers both the `getExportedNames` filter and the
// classifier-level ExportSpecifier reference filter
class C {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _atMaybeArray(_ref = this.items).call(_ref, 0);
  }
}
export type { C };