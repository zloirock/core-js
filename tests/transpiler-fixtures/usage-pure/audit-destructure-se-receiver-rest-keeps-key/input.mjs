// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let log = [];
const { from, ...rest } = (log.push(1), Array);
from([1]);
export { rest, log };
