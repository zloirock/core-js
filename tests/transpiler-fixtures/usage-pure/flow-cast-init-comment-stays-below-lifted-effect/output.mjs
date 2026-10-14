import _Array$from from "@core-js/pure/actual/array/from";
// A Flow cast around a sequence initializer lifts its effect out of the declaration as the bare
// sequence does, and the comment the declaration owns keeps leading it below that effect.

use(0);
log(/* cast */);
// owned by the declaration
const from = _Array$from;
use(from);