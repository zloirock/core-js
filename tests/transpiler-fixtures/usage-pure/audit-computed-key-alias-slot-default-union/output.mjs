import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
// a computed-key alias written through a pattern slot DEFAULT (`[k = "from"] = src`) has no single
// dominating value - the default fires only for an absent slot - so no primary key resolves; the
// written keys are still enumerable, and usage-global unions them exactly as it unions a conditional
// key write - through a member read and a computed-key destructure alike. dropping the read for the
// missing primary lost every key. usage-pure keeps its bail

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
export const filledSlotDefault = _Promise[promiseKey]([]);

// the destructure twin of the member read enumerates the same keys
let mapKey = 'keys';
[mapKey = 'groupBy'] = [];
const {
  [mapKey]: viaDestructure
} = _Map;
export const destructureSlotDefault = viaDestructure;