// A receiver-bearing default supplies a ponyfill only when its source slot is undefined.
// A live supplied slot keeps the corresponding native destructuring read.
function use() { /* empty */ }
const { Set: { customQ } = Set } = globalThis;
use(customQ);
