// per-specifier `export { type C }` - TS allows the `type` modifier on individual specifiers
// inside a value-export declaration. spec-level `exportKind === 'type'` is tsc-elided just
// like declaration-level `export type { ... }`, so closure-narrow stays in scope
class C {
  items = [1, 2, 3];
  getFirst() {
    return this.items.at(0);
  }
}
export { type C };