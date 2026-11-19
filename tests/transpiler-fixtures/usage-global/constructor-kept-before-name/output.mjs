import "core-js/modules/es.object.to-string";
import "core-js/modules/es.function.name";
import "core-js/modules/es.string.iterator";
// A known constructor still has observable instance property reads.
// Its excluded static keeps the earlier slot, as on the nested realm form.
const {
  from,
  name
} = Array;
use(from, name);
export {};