// Symbol-key consumption retains its selected receiver, call effects and argument order.
// Effectful realm keys stay inside the original receiver access.
const key = Symbol.iterator;
function getRealm() { setup(); return globalThis; }
export const result = (prefix(), getRealm()[(hop(), 'self')])[key](42);
