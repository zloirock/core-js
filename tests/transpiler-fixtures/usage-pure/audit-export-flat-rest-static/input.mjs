// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
export const { from, ...rest } = Array;
from([1]);
console.log(rest);
