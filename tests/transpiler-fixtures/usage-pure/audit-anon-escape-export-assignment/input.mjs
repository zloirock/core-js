// `export = {...}` is the TS-CJS sibling of the default export: importers hold the
// literal, so its `this.<field>` methods must widen like the `export default` form
// (a captured importer write flips the field to a foreign family at runtime)
const mod = {
  items: [1, 2],
  read() {
    return this.items.at(0);
  }
};
export = mod;
