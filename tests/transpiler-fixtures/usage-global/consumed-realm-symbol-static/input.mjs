// A consumed nested assignment yields the original realm after serving its symbol static.
let iterator;
const result = ({ Symbol: { iterator } } = globalThis);
use(result, iterator);
