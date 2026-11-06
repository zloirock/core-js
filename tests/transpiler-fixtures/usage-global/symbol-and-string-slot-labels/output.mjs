import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Global presence guard; the pure twin exercises distinct symbol and string slots.
// A symbol key and a string resembling its internal label name distinct properties.
// The default mirror must retain both reads and polyfill the instance method.
const row = [1, 2];
Object.defineProperty(row, '[@@iterator]', {
  get() {
    return 7;
  }
});
export function read({
  [Symbol.iterator]: iter,
  '[@@iterator]': tag,
  at
} = row) {
  return [tag, at.call(row, -1), iter.call(row).next().value];
}