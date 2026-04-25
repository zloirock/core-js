// `export type { X }` - declaration-level `exportKind: 'type'` flag lives on the
// ExportNamedDeclaration, not on the inner ExportSpecifier. plugin must still recognise
// this as a type-only position and NOT inject a polyfill (the identifier resolves to the
// local type alias, has no runtime binding)
type Set = unknown;
export type { Set };