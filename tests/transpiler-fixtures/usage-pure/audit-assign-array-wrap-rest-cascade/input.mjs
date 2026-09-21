// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let from, rest, other;
[{ from, ...rest }] = [Array];
from([1]);
rest;
[{ of: from, ...rest }, other] = [Array, 1];
from(2);
