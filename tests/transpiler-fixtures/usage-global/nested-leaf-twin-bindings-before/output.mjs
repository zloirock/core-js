import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.function.name";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// The nested leaf keeps its local bindings after extraction before a residual.
const {
  config: {
    items: {
      at,
      includes
    } = [],
    name
  }
} = APP_STATE;
use(() => [at, includes, name]);