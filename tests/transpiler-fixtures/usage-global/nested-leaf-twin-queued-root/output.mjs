import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// The earlier claim and nested leaf share the computed root.
// The surviving nested binding is read after both method slots.
const {
  includes,
  data: {
    at: method,
    other: {
      value
    }
  }
} = make();
use(includes, method, value);