// Object-rest keeps the affected assignment pattern native and preserves its RHS value.
// Independent reads and key/default expressions still receive their own polyfills.
let from, rest, other;
[{ from, ...rest }] = [Array];
from([1]);
rest;
[{ of: from, ...rest }, other] = [Array, 1];
from(2);
