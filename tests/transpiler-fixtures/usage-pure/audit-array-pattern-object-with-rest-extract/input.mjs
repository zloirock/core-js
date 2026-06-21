// nested object destructure with rest gather inside a single-element array destructure.
// the consumed static extracts ahead of the host and is renamed in place; the residual
// array destructure (rest included) is KEPT, not re-wrapped, like the multi-element path,
// and rest still collects the receiver's remaining enumerable keys
const [{ from, ...rest }] = [Array];
from([1]);
rest;
