import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// Exporting a destructured constructor carries its static methods to the importer.
// Getter effects stay in place; export-declaration and export-specifier forms agree.
const source = {
  get realm() {
    mark();
    return _globalThis;
  }
};
const {
    realm: _ref
  } = source,
  Value = _ref === _globalThis ? _Map : _ref.Map;
export { Value };