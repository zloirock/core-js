// A discarded assignment splits guarded static reads in property order.
// A live user default belongs to the raw read, which is evaluated once.
let M = pickConstructor();
if (!M) M = Array;
let first, method;
({ from: first, of: method = fallback() } = M);
export { first, method };
