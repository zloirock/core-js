// `export type { C }` is tsc-elided at runtime - the class isn't externally reachable
// for static-field mutation, so closure-narrow must keep the class-instance scope intact
// and `this.items.at(0)` resolves to array-specific `_atMaybeArray` instead of bailing to
// the generic `instance/at`. a type-only ExportSpecifier must not count as a live reference
class C {
  items = [1, 2, 3];
  getFirst() {
    return this.items.at(0);
  }
}
export type { C };
