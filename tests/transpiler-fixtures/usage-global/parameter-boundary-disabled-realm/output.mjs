import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// The enabled static is supplied; the disabled constructor keeps its native identity.
export function read({
  Array: {
    from
  },
  // core-js-disable-next-line
  Set: S
} = globalThis) {
  return [from, S];
}