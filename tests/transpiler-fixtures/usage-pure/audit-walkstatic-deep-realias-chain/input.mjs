// walkStaticReceiverChain dereference loop: chain of three const aliases of `Array`
// (A -> B -> C), then destructure `from` off the leaf. STATIC_WALK_DEPTH bounds the
// alias chain; this stays well below. resolveAliasedStaticReturn must follow the chain
// via staticPairFromDestructure -> walkStaticReceiverChain so `arr.findLast` /
// `arr.at` / `arr.includes` narrow to array-specific dispatch
const A = Array;
const B = A;
const C = B;
const { from } = C;
const arr = from('hi');
arr.findLast(c => c);
arr.at(-1);
arr.includes('h');
