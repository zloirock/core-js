import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// The fallback receiver is mirrored without replacing an explicitly supplied value.
export function read({
  w: {
    Array: {
      from
    }
  } = choose() ? globalThis : {}
} = {}) {
  return from([7]);
}