// A live constructor residual keeps the receiver's store and prefix, once and in order.
// The stored value remains the realm rather than the constructor used by the residual.
let held;
const { Map: { missing } } = (held = (record(), globalThis));
use(held, missing);
