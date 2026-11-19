import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Each key observes the binding at that point in the pattern; rest excludes both slots.
var {
  [(log(typeof from), 'from')]: from,
  [(log(typeof from), 'isArray')]: check,
  ...rest
} = Array;
use(from([1]), check([]), rest);