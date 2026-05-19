// `export default <Identifier>;` (bare identifier, no `.id` slot) re-exposes the local
// binding under the `default` name; importers do `import D from 'mod'; D.X = ...` to
// reach the class value. dual-coverage check: getExportedNames now adds the Identifier
// to the exported set AND the closure walker classifies the `export default C` ref as
// a leak via classBindingRefClassifier. either gate alone bails the narrow; both makes
// the soundness guarantee robust against future classifier / export-detection drift
class C {
  static items = [1, 2, 3];
  static getFirst() { return C.items.at(0); }
}
export default C;
C.getFirst();
