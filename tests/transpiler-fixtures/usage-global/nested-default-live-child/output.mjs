import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
// The default is a live receiver arm, with its own child claim.
// The present slot stays independent and its getter runs once.
export function read(source) {
  const {
    k: {
      at: method
    } = Array.from([4, 9])
  } = source;
  return method;
}