// `export default <Identifier>;` (bare identifier, no `.id` slot) re-exposes the local binding
// under the `default` name; importers do `import D from 'mod'; D.X = ...` to reach the class value.
// dual-coverage: the export-detection adds the Identifier to the exported set AND the closure walker
// classifies the ref as a leak. either gate alone bails the narrow; both guard against future drift
class C {
  static items = [1, 2, 3];
  static getFirst() { return C.items.at(0); }
}
export default C;
C.getFirst();
