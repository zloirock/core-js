// resolveComputedSymbolKey must unwrap TS wrappers in `prop.object` the same way as in handleBinaryIn
const iter = obj[(Symbol as any).iterator];
