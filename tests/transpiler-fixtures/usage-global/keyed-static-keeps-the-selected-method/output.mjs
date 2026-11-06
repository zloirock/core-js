import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A fallback arm cannot supply the method of a selected user object.
// The key still runs once before the method is read.
export function read(input) {
  const {
    slot: {
      [(effect(), 'from')]: from
    }
  } = {
    slot: input || Array
  };
  return from([3]);
}