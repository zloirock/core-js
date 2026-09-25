import "core-js/modules/es.symbol.async-iterator";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.math.sum-precise";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an ASSIGNMENT host and the computed-key reads keep a getter-read prefix element the way the
// declaration hosts do: in the rescue the discard owes, and in a key or a receiver whose sequence the
// fold collapses - in the order the source ran each
class K {
  static get g() {
    log();
    return 0;
  }
}
function mkObject() {
  log();
  return Object;
}
let a2;
({
  groupBy: a2
} = (K.g, mkObject()));
const iter = [1, 2][K.g, Symbol.iterator];
const folded = (K.g, globalThis).Math.sumPrecise;
const receiverIter = [1, 2][(K.g, globalThis).Symbol.asyncIterator];
use(a2, iter, folded, receiverIter);