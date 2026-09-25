// a computed-key alias written through a pattern slot DEFAULT over a literal that provably leaves the
// slot absent (`[k = "from"] = []`) holds that default and nothing else, so the key resolves - pure
// substitutes the static it names; a slot the literal FILLS keeps the default beside its value, a
// union usage-global injects for and usage-pure bails on. usage-global reads the same keys through a
// member read and a computed-key destructure alike

let arrayKey = 'isArray';
[arrayKey = 'fromAsync'] = [];
export const arraySlotDefault = Array[arrayKey]([]);

let objectKey = 'keys';
({ objectKey = 'fromEntries' } = {});
export const objectSlotDefault = Object[objectKey]([]);

// the paired slot value joins the union beside the default
let promiseKey = 'resolve';
[promiseKey = 'allSettled'] = ['any'];
export const filledSlotDefault = Promise[promiseKey]([]);

// the destructure twin of the member read enumerates the same keys
let mapKey = 'keys';
[mapKey = 'groupBy'] = [];
const { [mapKey]: viaDestructure } = Map;
export const destructureSlotDefault = viaDestructure;
