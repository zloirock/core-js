import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// per-specifier `export { type C }` - TS allows the `type` modifier on individual specifiers
// inside a value-export declaration. spec-level `exportKind === 'type'` is tsc-elided just
// like declaration-level `export type { ... }`, so closure-narrow stays in scope
class C {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _atMaybeArray(_ref = this.items).call(_ref, 0);
  }
}
export { type C };