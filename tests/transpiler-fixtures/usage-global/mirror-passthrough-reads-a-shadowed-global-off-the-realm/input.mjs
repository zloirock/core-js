// A mirror re-reads a receiver valued as a global by that global's name where its literal stands, and a
// binding of that name there - a parameter, a catch parameter, a local, an import - holds the user's own
// value: the read goes through the realm instead, from a nested container and in an assignment alike. A
// served constructor's read is its ponyfill, which no binding of the name shadows (`Symbol`).
import { Array } from './array.js';
export function viaParameter(Map) {
  const { a: { groupBy, prototype } } = { a: globalThis.Map };
  return [groupBy, prototype];
}
export function viaCatch() {
  try {
    run();
  } catch (Promise) {
    const { a: { try: attempt, prototype } } = { a: self.Promise };
    return [attempt, prototype];
  }
}
export function viaLocal() {
  const Iterator = null;
  const { a: { b: { from, prototype } } } = { a: { b: globalThis.Iterator } };
  return [from, prototype, Iterator];
}
let of, prototype;
({ a: { of, prototype } } = { a: globalThis.Array });
export function viaServed(Symbol) {
  const { a: { for: forKey, prototype: symbols } } = { a: globalThis.Symbol };
  return [forKey, symbols];
}
export { of, prototype, Array };
