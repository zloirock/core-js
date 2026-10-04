// An argument call through a symbol-key alias retains the selected receiver as this.
// The folded receiver owns its call and hop effects after the outer prefix runs.
// The outer prefix can sit beside iterator consumption or inside its receiver argument.
const key = Symbol.iterator;
function getRealm() { setup(); return globalThis; }
export const result = (prefix(), getRealm()[(hop(), 'self')])[key](42);
