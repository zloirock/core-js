import _at from "@core-js/pure/actual/instance/at";
// `export default <Identifier>;` (bare identifier, no `.id` slot) re-exposes the local binding
// under the `default` name; importers do `import D from 'mod'; D.X = ...` to reach the class value.
// dual-coverage: the export-detection adds the Identifier to the exported set AND the closure walker
// classifies the ref as a leak. either gate alone bails the narrow; both guard against future drift
class C {
  static items = [1, 2, 3];
  static getFirst() {
    var _ref;
    return _at(_ref = C.items).call(_ref, 0);
  }
}
export default C;
C.getFirst();