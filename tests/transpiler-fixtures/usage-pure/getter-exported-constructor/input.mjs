// Exporting a destructured constructor carries its static methods to the importer.
// Getter effects stay in place; export-declaration and export-specifier forms agree.
const source = { get realm() { mark(); return globalThis; } };
export const { realm: { Map: Value } } = source;
