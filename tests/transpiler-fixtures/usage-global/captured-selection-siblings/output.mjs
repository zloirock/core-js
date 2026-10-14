import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
// Each claimed sibling dispatches separately; custom undefined slots retain their defaults.
export function read(shim) {
  let from, of;
  const host = {
    from,
    of = fallback()
  } = shim || Array;
  return [host, from, of];
}