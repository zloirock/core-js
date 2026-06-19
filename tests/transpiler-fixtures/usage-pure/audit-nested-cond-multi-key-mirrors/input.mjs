// a nested ternary mirror with MULTIPLE inner statics: each resolvable static of the proxy
// branch (`from`, `of`) is mirrored into the synth literal, the user-object branch kept verbatim
const userObj = { Array: { from: () => "uf", of: () => "uo" } };
const { Array: { from, of } } = c ? globalThis : userObj;
from([1]);
of(2);
