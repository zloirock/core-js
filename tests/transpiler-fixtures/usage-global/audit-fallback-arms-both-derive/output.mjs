import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// a FALLBACK receiver whose arms are of different families is neither of them: picking one injects
// that family and drops the other's, which is the arm the runtime may take. a named-receiver
// disagreement is enumerable by name, a TYPE one is not - so it degrades to the typeless answer and
// both families derive. one method per line: the import set is the only observable here
const {
  at
} = c ? 'ab' : [1, 2];
const {
  includes
} = c || 'ab';
use(at, includes);