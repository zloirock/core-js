import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a DISCARDED read whose spine roots in an effectful sequence re-emits WHOLE, the read included -
// the source performed it after the effect, and the member above the sequence is not the dead
// proxy nav the drop gate retires; a read the sequence does not root keeps its trimmed shape
let n = 0;
const holder = {
  M: Map
};
const {
  groupBy: fromHolder
} = (n++, holder).M;
const {
  from: fromRealm
} = (n++, globalThis).Array;
const {
  fromEntries: fromTail
} = (n++, globalThis.Object);
use(fromHolder, fromRealm, fromTail);