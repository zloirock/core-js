// `Symbol[Symbol.foo] in obj` - inner Symbol-ref is genuine but the well-known name `foo`
// is not in symbolKeyToEntry. handleBinaryIn's resolveSymbolInEntry would return null and
// the seeding bails, leaving the inner Symbol Identifier free to receive its own polyfill
// (unrelated chain). known-good case `Symbol.iterator` follows for distinct-method parity
const a = Symbol[Symbol.foo] in obj;
const b = Symbol.iterator in obj;
[a, b].at(0);
