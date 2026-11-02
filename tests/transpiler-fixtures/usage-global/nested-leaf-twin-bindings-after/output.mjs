import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.array.values";
import "core-js/modules/es.function.name";
import "core-js/modules/web.dom-collections.keys";
import "core-js/modules/web.dom-collections.values";
// The nested leaf keeps its local bindings after extraction behind a residual.
const {
  config: {
    name,
    filters: {
      keys,
      values
    } = {}
  }
} = APP_STATE;
use(() => [keys, values, name]);