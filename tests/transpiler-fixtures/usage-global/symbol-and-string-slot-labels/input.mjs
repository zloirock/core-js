// Global presence guard; the pure twin exercises distinct symbol and string slots.
// A symbol key and a string resembling its internal label name distinct properties.
// The default mirror must retain both reads and polyfill the instance method.
const row = [1, 2];
Object.defineProperty(row, '[@@iterator]', { get() { return 7; } });
export function read({ [Symbol.iterator]: iter, '[@@iterator]': tag, at } = row) {
  return [tag, at.call(row, -1), iter.call(row).next().value];
}
