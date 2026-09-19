// Effectful proxy keys preserve the optional guard of a mutation through a sealed chain.
// An absent window makes the sealed write throw; each computed key still runs once.
export function write(value) {
  (globalThis[(effect(), 'self')][(effect(), 'window')]?.Object).probe = value;
}
export function update() {
  (globalThis[(effect(), 'self')][(effect(), 'window')]?.Object).probe++;
}
export function assign(values) {
  [(globalThis[(effect(), 'self')][(effect(), 'window')]?.Object).probe] = values;
}
export function iterate(values) {
  for ((globalThis[(effect(), 'self')][(effect(), 'window')]?.Object).probe of values);
}
// A read has no mutation obligation and keeps the value-collapse contract.
export const read = (globalThis[(effect(), 'self')][(effect(), 'window')]?.Object).probe;
