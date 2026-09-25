import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise from "@core-js/pure/actual/promise";
// a computed-key alias written through a pattern slot DEFAULT over a literal that provably leaves the
// slot absent (`[k = "from"] = []`) holds that default and nothing else, so the key resolves - pure
// substitutes the static it names; a slot the literal FILLS keeps the default beside its value, a
// union usage-global injects for and usage-pure bails on. usage-global reads the same keys through a
// member read and a computed-key destructure alike

let arrayKey = 'isArray';
[arrayKey = 'fromAsync'] = [];
export const arraySlotDefault = _Array$fromAsync([]);
let objectKey = 'keys';
({
  objectKey = 'fromEntries'
} = {});
export const objectSlotDefault = _Object$fromEntries([]);

// the paired slot value joins the union beside the default
let promiseKey = 'resolve';
[promiseKey = 'allSettled'] = ['any'];
export const filledSlotDefault = _Promise[promiseKey]([]);

// the destructure twin of the member read enumerates the same keys
let mapKey = 'keys';
[mapKey = 'groupBy'] = [];
const viaDestructure = _Map$groupBy;
export const destructureSlotDefault = viaDestructure;