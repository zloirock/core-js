// A fully-consumed static-method prop under an inner rest keeps a `<key>: _unused` sentinel so
// `...rest` does not gather the originally-excluded key. The sentinel key comes from the canonical
// key-source accessor, which handles StringLiteral keys - a raw `key.name` check (Identifier-only)
// would drop the sentinel for a string key, letting rest capture it. Nested under an outer prop.
const src = { o: Object };
const { o: { "keys": k, ...rest } } = src;
export { k, rest };
