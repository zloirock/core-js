// a nested default that CARRIES the receiver: the outer slot is unknown, so what runs when it is
// undefined IS the default - and a mirror of that default fires under exactly the same condition,
// which makes it correct on every host, not only in a parameter list. where the slot IS defined its
// own value is read, so an instance key (`entries`) dispatches off it as well. one static per host so
// a dropped host is visible in the import set. the last three are controls: a proxy-global receiver
// still resolves through the OUTER chain and flattens, a default carrying no receiver stays native,
// and a resolvable outer chain leaves its dead default alone
const src = {};
// A receiver-bearing default supplies a ponyfill only when its source slot is undefined.
// A live supplied slot keeps the corresponding native destructuring read.
function use() { /* empty */ }
let entries;
({ b: { entries } = Object } = src);
use(entries);
