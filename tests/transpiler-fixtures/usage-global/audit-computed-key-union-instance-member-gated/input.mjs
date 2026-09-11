// computed-key union where a union MEMBER (not the primary key) is an instance method on the
// constructor: `Array[K]` resolves K to 'from' (a valid static) as the primary, and recovers 'concat'
// from the conditional reassignment as an extra candidate. 'concat' is an Array.prototype method gated
// off the Array constructor, so only es.array.from injects - the extra is gated by the same
// receiver-type check as the primary meta, not over-injected
let K = 'from';
if (Date.now() % 2) K = 'concat';
Array[K]([1, 2, 3]);
