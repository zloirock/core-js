import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// Nested reads keep logical assignment and its selected value, including a prefix.
let a,
  b,
  c = source;
const {
  list: {
    at
  }
} = a ||= make();
const {
  list: {
    includes
  }
} = (note(), b ??= make());
const {
  list: {
    flat
  }
} = c &&= make();