// A symbol-key alias consumes a receiver with a prefix and computed proxy-hop effect.
// The folded receiver retains its own call and hop effects, so they must not replay outside it.
// The outer prefix can sit beside iterator consumption or inside its receiver argument.
const key = Symbol.iterator;
function getRealm() { setup(); return globalThis; }
export const result = (prefix(), getRealm()[(hop(), 'self')])[key]();
