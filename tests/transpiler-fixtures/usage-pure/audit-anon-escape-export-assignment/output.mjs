import _at from "@core-js/pure/actual/instance/at";
// `export = {...}` is the TS-CJS sibling of the default export: importers hold the
// literal, so its `this.<field>` methods must widen like the `export default` form
// (a captured importer write flips the field to a foreign family at runtime)
const mod = {
  items: [1, 2],
  read() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
};
export = mod;