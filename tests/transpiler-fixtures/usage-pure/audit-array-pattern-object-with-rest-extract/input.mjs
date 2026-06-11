// nested object destructure with rest gather inside a single-element array destructure.
// the static extracts into a `const <local> = _Polyfill` ahead of the host and the consumed
// key is renamed in place - the residual array destructure (rest included) is KEPT, not
// re-wrapped, exactly like the multi-element path; rest still collects the receiver's
// remaining enumerable keys. the historical bail rationale ("residual rendering can't re-wrap
// the outer ArrayPattern") was defeated by the multi-element emission proving no re-wrap happens
const [{ from, ...rest }] = [Array];
from([1]);
rest;
