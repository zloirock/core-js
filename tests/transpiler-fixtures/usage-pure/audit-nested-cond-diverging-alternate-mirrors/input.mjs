// a nested destructure off a ternary whose branches DIVERGE: a global proxy vs a user object with
// its own Array.from. each branch is mirrored independently - the proxy branch becomes a synth
// literal binding the polyfill (always, so a buggy native is replaced too), the user-object branch
// stays verbatim. the runtime selection picks per call and each side stays correct
const userObj = { Array: { from: function () { return 'USER'; } } };
let useGlobal = false;
const { Array: { from } } = useGlobal ? globalThis : userObj;
from([7, 8]);
