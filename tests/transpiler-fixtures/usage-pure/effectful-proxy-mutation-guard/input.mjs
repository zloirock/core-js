// Effectful realm keys preserve native guards and sealed mutation throws.
// Assignment, update, pattern and loop write targets keep both key effects.
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
export const read = (globalThis[(effect(), 'self')][(effect(), 'window')]?.Object).probe;
