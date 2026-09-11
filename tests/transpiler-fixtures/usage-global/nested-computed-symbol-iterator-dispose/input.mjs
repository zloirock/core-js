// chained computed Symbol-keyed accesses: optional `[Symbol.iterator]()` returns a
// disposable resource whose `[Symbol.dispose]` is then read. Two separate well-known-
// symbol polyfills must be detected on the chain
obj[Symbol.iterator]?.()[Symbol.dispose];
