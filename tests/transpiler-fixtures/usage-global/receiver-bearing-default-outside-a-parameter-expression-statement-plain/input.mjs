// A receiver-bearing default supplies a ponyfill only when its source slot is undefined.
// A live supplied slot keeps the corresponding native destructuring read.
const src = {};
function use() { /* empty */ }
const { h: { plain } = {} } = src;
use(plain);
