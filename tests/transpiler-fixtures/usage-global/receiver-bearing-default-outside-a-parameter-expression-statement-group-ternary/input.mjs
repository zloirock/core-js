// A receiver-bearing default supplies a ponyfill only when its source slot is undefined.
// A live supplied slot keeps the corresponding native destructuring read.
const src = {};
const flag = true;
function use() { /* empty */ }
const { b2: { groupBy: groupTernary } = flag ? Map : Object } = src;
use(groupTernary);
