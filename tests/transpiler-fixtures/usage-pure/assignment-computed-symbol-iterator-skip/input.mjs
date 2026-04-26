// `obj[Symbol.iterator] = fn` is a write to a computed key, not a value access -
// is-iterable / iteration-protocol routing is skipped in assignment target position.
// The well-known symbol values themselves are still polyfilled.
obj[Symbol.iterator] = fn;
obj[Symbol.asyncIterator] = fn;
