import "core-js/modules/es.object.to-string";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// The served function-name read precedes the excluded static.
// Reversing source siblings reverses their runtime reads as well.
const {
  Array: {
    name,
    from
  }
} = globalThis;
use(from, name);
export {};