import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Same-line siblings keep each annotation inside its original conditional.
// The static call is served; its comment must not move to the declaration.
// Entering the source block must not print either comment a second time.
let value;
if (enabled) {
  /* branch */value = /* value */Array.from(input);
}
use(value);