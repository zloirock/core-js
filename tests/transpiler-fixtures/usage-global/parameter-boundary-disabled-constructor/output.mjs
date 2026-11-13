import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Mirroring a constructor does not serve its disabled static sibling.
export function read({
  from,
  // core-js-disable-next-line
  of
} = Array) {
  return [from, of];
}