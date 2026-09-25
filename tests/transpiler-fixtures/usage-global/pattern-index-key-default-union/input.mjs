// an object pattern spelling an ARRAY index (`{ 0: w = ... }`) pairs the element under it, beside the
// slot default: a read of the reassigned binding reaches both - the element's `Object` and the
// default's `Map` - however many earlier questions asked about the same write without folding its key
let w = { k: Object };
({ 0: w = { k: Map } } = [{ k: Object }]);
const { k: { groupBy: g } } = w;
export const grouped = g(src, x => x);
