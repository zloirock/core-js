import "core-js/modules/es.object.to-string";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// An excluded static remains before the served function-name read.
// The raw constructor hop retains its ordered source slots.
const {
  Array: {
    from,
    name
  }
} = globalThis;
use(from, name);
export {};