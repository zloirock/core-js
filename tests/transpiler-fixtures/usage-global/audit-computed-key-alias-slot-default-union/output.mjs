import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a computed-key alias written through a pattern slot DEFAULT over a literal that provably leaves the
// slot absent (`[k = "from"] = []`) holds that default and nothing else, so the key resolves - pure
// substitutes the static it names; a slot the literal FILLS keeps the default beside its value, a
// union usage-global injects for and usage-pure bails on. usage-global reads the same keys through a
// member read and a computed-key destructure alike

let arrayKey = 'isArray';
[arrayKey = 'fromAsync'] = [];
export const arraySlotDefault = Array[arrayKey]([]);
let objectKey = 'keys';
({
  objectKey = 'fromEntries'
} = {});
export const objectSlotDefault = Object[objectKey]([]);

// the paired slot value joins the union beside the default
let promiseKey = 'resolve';
[promiseKey = 'allSettled'] = ['any'];
export const filledSlotDefault = Promise[promiseKey]([]);

// the destructure twin of the member read enumerates the same keys
let mapKey = 'keys';
[mapKey = 'groupBy'] = [];
const {
  [mapKey]: viaDestructure
} = Map;
export const destructureSlotDefault = viaDestructure;