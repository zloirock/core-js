import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A Flow cast around a sequence initializer lifts its effect out of the declaration as the bare
// sequence does, and the comment the declaration owns keeps leading it below that effect.

use(0);
// owned by the declaration
const {
  from
} = ((log(/* cast */), Array): any);
use(from);