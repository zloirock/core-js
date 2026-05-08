// Minifier-shaped `(0, ({Array:{from}} = globalThis))` keeps the destructure-assignment as a SE tail.
// Flatten must peel the SE only at the tail position so `from` resolves while leading effects stay in order.
let from;
(0, ({ Array: { from } } = globalThis));
const arr = from([1, 2, 3]);
export { arr };
