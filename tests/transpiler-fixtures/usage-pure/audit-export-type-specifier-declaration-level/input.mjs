// `export type { X }` - declaration-level `exportKind: 'type'` flag lives on the
// named-export node, not on the inner re-export specifier. plugin must still recognise
// this as a type-only position and NOT inject a polyfill (the identifier resolves to the
// local type alias, has no runtime binding)
type Set = unknown;
export type { Set };
