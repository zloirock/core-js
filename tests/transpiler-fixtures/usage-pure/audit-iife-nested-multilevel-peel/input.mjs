// nested IIFE shells: `(() => (() => Receiver)())()`. `unwrapReceiverLeaf` calls
// `peelIIFEReturn` in a loop, so multi-level peel proceeds: outer IIFE returns inner
// CallExpression, next iteration peels that inner IIFE to its body return Identifier.
// distinct methods on each line trace which leaf receiver was reached.
const a = ((() => Array)()).from([1]);
const b = ((() => Set)()).prototype.intersection;
const c = ((() => (() => Array)())()).of(1, 2);
export { a, b, c };
