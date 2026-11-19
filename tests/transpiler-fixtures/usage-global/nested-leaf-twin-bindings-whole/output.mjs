import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// Replacing the whole nested pattern must not leave bindings on its old identifiers.
const {
  config: {
    items: {
      at,
      includes
    } = []
  }
} = APP_STATE;
use(() => [at, includes]);