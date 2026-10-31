import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
// the KEY axis follows the same alias channels as the receiver axis: a computed key reassigned to
// hold another alias (`k = k0`) reaches k0's transitive key reassignments, so `arr[k]` dispatches
// both es.array.at and es.array.flat at runtime and the union injects both (over-inject-safe)
const arr = [];
let k0 = 'at';
if (c) k0 = 'flat';
let k;
k = k0;
arr[k]();