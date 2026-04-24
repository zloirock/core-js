// `Symbol.iterator in obj` - polyfillable well-known symbol. plugin rewrites the
// whole expression to the `isIterable` helper; outer `Symbol` identifier is subsumed
const a = Symbol.iterator in obj;
// `Symbol.match in obj2` - not rewritable to a single helper, so plugin keeps the
// expression shape but still needs to polyfill the `Symbol.match` member access
const b = Symbol.match in obj2;
